import "server-only";

import { Redis } from "@upstash/redis";
import type { VaultData } from "./vaults";

/**
 * Persistent layer for the vault numbers (Upstash Redis).
 *
 * Two keys:
 *   vaults:latest   — the last successful snapshot, one row per vault.
 *                     Read when an upstream API fails (also at build time),
 *                     so a deploy or outage never turns live figures into "—".
 *   vaults:history  — sorted set of snapshots (score = unix ms), sampled at
 *                     most every HISTORY_SAMPLE_MS and kept HISTORY_RETENTION_MS.
 *                     Not displayed yet; it is the record of what the site
 *                     showed and the input for a future APY chart.
 *
 * Configuration (either pair works; the KV_* names are what the existing
 * Presto Digital site uses for its Upstash database):
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *   KV_REST_API_URL        / KV_REST_API_TOKEN
 * With neither set the store is disabled and the site behaves as before.
 */

export type Snapshot = { savedAt: number; vaults: VaultData[] };

export interface VaultStore {
  readLatest(): Promise<Snapshot | null>;
  writeLatest(snapshot: Snapshot): Promise<void>;
  appendHistory(snapshot: Snapshot): Promise<void>;
}

const LATEST_KEY = "vaults:latest";
const HISTORY_KEY = "vaults:history";
const HISTORY_SAMPLE_MS = 5 * 60 * 1000; // one point per 5 minutes
const HISTORY_RETENTION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days ≈ 26k points
const STORE_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), STORE_TIMEOUT_MS)
    ),
  ]);
}

export function createUpstashStore(redis: Redis): VaultStore {
  return {
    async readLatest() {
      const value = await withTimeout(redis.get<Snapshot>(LATEST_KEY), "redis.get");
      return value && Array.isArray(value.vaults) ? value : null;
    },

    async writeLatest(snapshot) {
      await withTimeout(redis.set(LATEST_KEY, snapshot), "redis.set");
    },

    async appendHistory(snapshot) {
      // Keep the history sparse: skip if the newest point is younger than the sample interval.
      const newest = await withTimeout(
        redis.zrange<string[]>(HISTORY_KEY, -1, -1, { withScores: true }),
        "redis.zrange"
      );
      const newestScore = newest.length >= 2 ? Number(newest[1]) : 0;
      if (snapshot.savedAt - newestScore < HISTORY_SAMPLE_MS) return;

      const point = snapshot.vaults.map((v) => ({ id: v.id, apy: v.apy, tvlUsd: v.tvlUsd }));
      await withTimeout(
        redis.zadd(HISTORY_KEY, {
          score: snapshot.savedAt,
          member: JSON.stringify({ t: snapshot.savedAt, v: point }),
        }),
        "redis.zadd"
      );
      await withTimeout(
        redis.zremrangebyscore(HISTORY_KEY, 0, snapshot.savedAt - HISTORY_RETENTION_MS),
        "redis.zremrangebyscore"
      );
    },
  };
}

/** In-memory store with the same contract, for tests and local runs without Redis. */
export function createMemoryStore(): VaultStore {
  let latest: Snapshot | null = null;
  const history: { score: number; member: string }[] = [];
  return {
    async readLatest() {
      return latest;
    },
    async writeLatest(snapshot) {
      latest = snapshot;
    },
    async appendHistory(snapshot) {
      const newest = history.at(-1)?.score ?? 0;
      if (snapshot.savedAt - newest < HISTORY_SAMPLE_MS) return;
      history.push({ score: snapshot.savedAt, member: JSON.stringify(snapshot) });
    },
  };
}

let cached: VaultStore | null | undefined;

/** The configured store, or null when no Redis credentials are present. */
export function getVaultStore(): VaultStore | null {
  if (cached !== undefined) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (process.env.VAULT_STORE === "memory") {
    cached = createMemoryStore();
  } else if (url && token) {
    cached = createUpstashStore(new Redis({ url, token }));
  } else {
    cached = null;
  }
  return cached;
}
