import "server-only";

import { knownAssets, vaults, type VaultConfig } from "@/data/vaults";

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
  /** Collateral / allocation exposure shown as overlapping icons */
  exposure: { symbol: string; logoURI?: string }[];
  /** false when the fallback values were used */
  live: boolean;
};

const MORPHO_API_URL = process.env.MORPHO_API_URL ?? "https://api.morpho.org/graphql";
const SYMBIOTIC_API_URL = process.env.SYMBIOTIC_API_URL ?? "https://app.symbiotic.fi/api/v3/vaults";
const REVALIDATE = Number(process.env.VAULT_REVALIDATE_SECONDS ?? 300);
const FETCH_TIMEOUT_MS = 8000;

// ---------------------------------------------------------------------------
// Morpho (Vault V2) — public GraphQL API, no key required.
// Docs: https://docs.morpho.org/tools/offchain/api/get-started/
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
      avgNetApy(lookback: SEVEN_DAYS)
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
      avgNetApy: number | null;
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
    next: { revalidate: REVALIDATE },
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
    apy: vault.netApy ?? vault.avgNetApy ?? null,
    tvlUsd: vault.totalAssetsUsd ?? null,
    exposure: exposure.length ? exposure : config.fallback.exposure,
    live: true,
  };
}

// ---------------------------------------------------------------------------
// Symbiotic — the public API that powers app.symbiotic.fi. It is not formally
// documented, so the parser is deliberately defensive and falls back to the
// static config on any shape change.
// ---------------------------------------------------------------------------

type SymbioticVault = {
  address: string;
  collateral?: string;
  tvl?: number | string | null;
  meta?: { name?: string; icon?: string };
  adapters?: {
    address: string;
    lockedTvl?: number;
    meta?: { name?: string; icon?: string };
  }[];
  rewards?: { apr?: number | null; weeklyApr?: number | null };
};

async function fetchSymbioticVault(config: VaultConfig): Promise<VaultData> {
  const res = await fetch(SYMBIOTIC_API_URL, {
    headers: { accept: "application/json" },
    next: { revalidate: REVALIDATE },
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
  const apr = vault.rewards?.apr ?? vault.rewards?.weeklyApr ?? null;
  const asset =
    (vault.collateral && knownAssets[vault.collateral.toLowerCase()]) || config.fallback.asset;

  // Allocations into underlying vaults (e.g. Presto's Morpho vaults).
  const exposure = (vault.adapters ?? [])
    .filter((a) => a.meta?.name)
    .sort((a, b) => (b.lockedTvl ?? 0) - (a.lockedTvl ?? 0))
    .map((a) => ({ symbol: a.meta!.name!, logoURI: a.meta?.icon }));

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
    exposure: exposure.length ? exposure : config.fallback.exposure,
    live: true,
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
    exposure: config.fallback.exposure,
    live: false,
  };
}

/**
 * Fetches every configured vault in parallel. A failing vault never breaks the
 * page: it is rendered from its fallback config instead.
 */
export async function getVaults(): Promise<VaultData[]> {
  return Promise.all(
    vaults.map(async (config) => {
      try {
        return config.protocol === "morpho"
          ? await fetchMorphoVault(config)
          : await fetchSymbioticVault(config);
      } catch (error) {
        console.warn(`[vaults] ${config.id}: using fallback —`, (error as Error).message);
        return fallbackFor(config);
      }
    })
  );
}
