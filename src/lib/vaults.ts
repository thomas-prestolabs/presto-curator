import "server-only";

import { knownAssets, vaults, type VaultConfig } from "@/data/vaults";
import { getVaultStore, type Snapshot } from "./vault-store";

/** Normalised shape consumed by the UI. */
export type VaultData = {
  id: string;
  protocol: VaultConfig["protocol"];
  protocolLabel: string;
  name: string;
  href: string;
  chainLabel: string;
  asset: string;
  /** Net APY as a fraction (0.0442 === 4.42 %), null when unknown */
  apy: number | null;
  /** USD TVL, null when unknown */
  tvlUsd: number | null;
  /** Collateral exposure shown as overlapping icons (empty = row hidden) */
  exposure: { symbol: string; logoURI?: string }[];
  /** Where the figures came from: the protocol API, the last good snapshot in Redis, or static config */
  source: "api" | "store" | "fallback";
  /** true for real figures (api or store), false for the static placeholder */
  live: boolean;
  /** Unix ms of the API read the figures come from */
  fetchedAt: number;
};

const MORPHO_API_URL = process.env.MORPHO_API_URL ?? "https://api.morpho.org/graphql";
const SYMBIOTIC_API_URL = process.env.SYMBIOTIC_API_URL ?? "https://app.symbiotic.fi/api/v3/vaults";
export const REVALIDATE_SECONDS = Number(process.env.VAULT_REVALIDATE_SECONDS ?? 60);
const FETCH_TIMEOUT_MS = 8000;

/**
 * Every upstream read goes through Next's data cache: a value is reused for
 * REVALIDATE_SECONDS no matter how many visitors arrive, so the protocol APIs
 * see at most one request per vault per window, not one per page view.
 */
const cacheOptions: RequestInit = { next: { revalidate: REVALIDATE_SECONDS } };

// ---------------------------------------------------------------------------
// Morpho (Vault V2) — public GraphQL API, no key required.
// Docs: https://docs.morpho.org/tools/offchain/api/get-started/
//
// `netApy` is the figure app.morpho.org shows as "Net APY" on the vault page
// (verified 2026-10-12: page 4.54 % ↔ netApy 0.045409). It is an instantaneous
// rate, so it moves minute to minute; see formatApy() for the matching rounding.
// ---------------------------------------------------------------------------

const MORPHO_VAULT_QUERY = /* GraphQL */ `
  query PrestoVault($address: String!, $chainId: Int!) {
    vaultV2ByAddress(address: $address, chainId: $chainId) {
      address
      name
      asset {
        symbol
        logoURI
      }
      totalAssetsUsd
      netApy
      caps(first: 50) {
        items {
          type
          allocation
          data {
            __typename
            ... on CollateralCapData {
              collateralToken {
                symbol
                logoURI
              }
            }
          }
        }
      }
    }
  }
`;

type CollateralCap = {
  type: "Collateral";
  allocation: number | string | null;
  data: {
    __typename: "CollateralCapData";
    collateralToken: { symbol: string; logoURI: string | null };
  };
};

type OtherCap = {
  type: "Adapter" | "MarketV1" | "Unknown";
  allocation: number | string | null;
  data: { __typename: string };
};

type MorphoVaultResponse = {
  data?: {
    vaultV2ByAddress?: {
      address: string;
      name: string;
      asset: { symbol: string; logoURI: string | null };
      totalAssetsUsd: number | null;
      netApy: number | null;
      caps: { items: (CollateralCap | OtherCap)[] };
    } | null;
  };
  errors?: { message: string }[];
};

function isCollateralCap(cap: CollateralCap | OtherCap): cap is CollateralCap {
  return cap.type === "Collateral" && cap.data.__typename === "CollateralCapData";
}

async function fetchMorphoVault(config: VaultConfig): Promise<VaultData> {
  const res = await fetch(MORPHO_API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: MORPHO_VAULT_QUERY,
      variables: { address: config.address, chainId: config.chainId },
    }),
    ...cacheOptions,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`Morpho API HTTP ${res.status}`);
  const json = (await res.json()) as MorphoVaultResponse;
  const vault = json.data?.vaultV2ByAddress;
  if (!vault) throw new Error(json.errors?.[0]?.message ?? "Morpho API returned no vault");

  // Collateral caps describe every collateral the curator has enabled, including
  // markets that are currently 0 % allocated — that is the "disclosed exposure".
  const exposure = vault.caps.items
    .filter(isCollateralCap)
    .sort((a, b) => Number(b.allocation ?? 0) - Number(a.allocation ?? 0))
    .map((cap) => ({
      symbol: cap.data.collateralToken.symbol,
      logoURI: cap.data.collateralToken.logoURI ?? undefined,
    }));

  return {
    id: config.id,
    protocol: config.protocol,
    protocolLabel: config.protocolLabel,
    name: config.name,
    href: config.href,
    chainLabel: config.chainLabel,
    asset: vault.asset.symbol,
    apy: vault.netApy ?? null,
    tvlUsd: vault.totalAssetsUsd ?? null,
    exposure: config.showExposure ? (exposure.length ? exposure : config.fallback.exposure) : [],
    source: "api",
    live: true,
    fetchedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Symbiotic — the public API that powers app.symbiotic.fi. It is not formally
// documented, so the parser is deliberately defensive and falls back to the
// static config on any shape change.
//
// app.symbiotic.fi shows "APY" as the 7-day rewards APR by default
// (verified 2026-10-12: page 4.36 % ↔ rewards.weeklyApr 0.0436), so that is
// the field used here; `rewards.apr` is the spot figure.
// ---------------------------------------------------------------------------

type SymbioticVault = {
  address: string;
  collateral?: string;
  tvl?: number | string | null;
  meta?: { name?: string; icon?: string };
  rewards?: { apr?: number | null; weeklyApr?: number | null };
};

async function fetchSymbioticVault(config: VaultConfig): Promise<VaultData> {
  const res = await fetch(SYMBIOTIC_API_URL, {
    headers: { accept: "application/json" },
    ...cacheOptions,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Symbiotic API HTTP ${res.status}`);

  const list = (await res.json()) as unknown;
  if (!Array.isArray(list)) throw new Error("Symbiotic API returned an unexpected shape");

  const vault = (list as SymbioticVault[]).find(
    (v) =>
      typeof v?.address === "string" && v.address.toLowerCase() === config.address.toLowerCase()
  );
  if (!vault) throw new Error("Symbiotic API did not return the configured vault");

  const tvl = vault.tvl == null ? null : Number(vault.tvl);
  const apr = vault.rewards?.weeklyApr ?? vault.rewards?.apr ?? null;
  const asset =
    (vault.collateral && knownAssets[vault.collateral.toLowerCase()]) || config.fallback.asset;

  return {
    id: config.id,
    protocol: config.protocol,
    protocolLabel: config.protocolLabel,
    name: config.name,
    href: config.href,
    chainLabel: config.chainLabel,
    asset,
    apy: typeof apr === "number" && Number.isFinite(apr) ? apr : null,
    tvlUsd: tvl != null && Number.isFinite(tvl) ? tvl : null,
    exposure: config.showExposure ? config.fallback.exposure : [],
    source: "api",
    live: true,
    fetchedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------

function fallbackFor(config: VaultConfig): VaultData {
  return {
    id: config.id,
    protocol: config.protocol,
    protocolLabel: config.protocolLabel,
    name: config.name,
    href: config.href,
    chainLabel: config.chainLabel,
    asset: config.fallback.asset,
    apy: config.fallback.apy,
    tvlUsd: config.fallback.tvlUsd,
    exposure: config.showExposure ? config.fallback.exposure : [],
    source: "fallback",
    live: false,
    fetchedAt: Date.now(),
  };
}

const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Fetches every configured vault in parallel (results are cached, see above)
 * and keeps the persistent layer in sync.
 *
 * Failure policy, per vault:
 * 1. API read succeeded → use it, and store the snapshot in Redis.
 * 2. API read failed, Redis has a last good snapshot → show that (real figures,
 *    older timestamp). Covers deploys and builds that happen during an outage.
 * 3. No Redis (or nothing stored yet):
 *    - during `next build` or in development, render the static fallback;
 *    - at runtime in production, throw so Next keeps serving the previously
 *      generated ISR page and retries on the next request.
 */
export async function getVaults(): Promise<VaultData[]> {
  const store = getVaultStore();

  const results = await Promise.allSettled(
    vaults.map((config) =>
      config.protocol === "morpho" ? fetchMorphoVault(config) : fetchSymbioticVault(config)
    )
  );

  const failures = results.flatMap((r, i) =>
    r.status === "rejected" ? [`${vaults[i].id}: ${(r.reason as Error).message}`] : []
  );

  let previous: Snapshot | null = null;
  if (failures.length > 0 && store) {
    try {
      previous = await store.readLatest();
    } catch (error) {
      console.warn("[vaults] could not read last snapshot —", (error as Error).message);
    }
  }

  const rows: VaultData[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    const config = vaults[i];
    const last = previous?.vaults.find((v) => v.id === config.id && v.live);
    return last ? { ...last, source: "store" } : fallbackFor(config);
  });

  if (failures.length > 0) {
    const unresolved = rows.filter((row) => row.source === "fallback").map((row) => row.id);
    if (unresolved.length > 0 && IS_PROD && !IS_BUILD) {
      throw new Error(`[vaults] upstream read failed — ${failures.join("; ")}`);
    }
    console.warn(
      `[vaults] ${failures.join("; ")} — served from ${previous ? "snapshot" : "fallback"}`
    );
  }

  if (store) {
    const complete = rows.every((row) => row.source === "api");
    const snapshot: Snapshot = { savedAt: Date.now(), vaults: rows.filter((row) => row.live) };
    try {
      if (snapshot.vaults.length > 0) await store.writeLatest(snapshot);
      if (complete) await store.appendHistory(snapshot);
    } catch (error) {
      console.warn("[vaults] could not write snapshot —", (error as Error).message);
    }
  }

  return rows;
}
