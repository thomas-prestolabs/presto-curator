/**
 * Vaults shown in the "Vaults" section, in display order.
 *
 * Live numbers (APY, TVL, collateral) are fetched on the server from the
 * protocol APIs (see src/lib/vaults.ts). The `fallback` block is only used
 * when the API is unreachable, so the page never renders empty cards.
 */

export type VaultProtocol = "morpho" | "symbiotic";

export type VaultConfig = {
  /** Stable key used for React keys and logging */
  id: string;
  protocol: VaultProtocol;
  /** Label shown above the vault name (e.g. "Morpho") */
  protocolLabel: string;
  /** Display name shown in the card (rendered uppercase) */
  name: string;
  address: `0x${string}`;
  chainId: number;
  chainLabel: string;
  /** Link to the vault on the protocol app */
  href: string;
  /** Show the row of collateral icons under the chips */
  showExposure: boolean;
  fallback: {
    asset: string;
    apy: number | null; // 0.0442 === 4.42 %
    tvlUsd: number | null;
    exposure: { symbol: string; logoURI?: string }[];
  };
};

export const vaults: VaultConfig[] = [
  {
    id: "morpho-forte",
    protocol: "morpho",
    protocolLabel: "Morpho",
    name: "Presto USDC Forte",
    address: "0x68A65f315BCd3C3456d1368Ff88bC661856548E1",
    chainId: 1,
    chainLabel: "Ethereum",
    href: "https://app.morpho.org/ethereum/vault/0x68A65f315BCd3C3456d1368Ff88bC661856548E1/presto-usdc-forte",
    showExposure: true,
    fallback: {
      asset: "USDC",
      apy: null,
      tvlUsd: null,
      exposure: [{ symbol: "wFalconX" }, { symbol: "wJAAA" }, { symbol: "AA_FalconXUSDC" }],
    },
  },
  {
    id: "morpho-prime",
    protocol: "morpho",
    protocolLabel: "Morpho",
    name: "Presto USDC Prime",
    address: "0x133614490896bc02C774bc3399E4Db1B6D05a2CA",
    chainId: 1,
    chainLabel: "Ethereum",
    href: "https://app.morpho.org/ethereum/vault/0x133614490896bc02C774bc3399E4Db1B6D05a2CA/presto-usdc-prime",
    showExposure: true,
    fallback: {
      asset: "USDC",
      apy: null,
      tvlUsd: null,
      exposure: [{ symbol: "WBTC" }],
    },
  },
  {
    id: "symbiotic-usdc",
    protocol: "symbiotic",
    protocolLabel: "Symbiotic",
    name: "Presto USDC Vault",
    address: "0x4f7EA018239FfBdCf52133B9E98a498B2B4b9F32",
    chainId: 1,
    chainLabel: "Ethereum",
    href: "https://app.symbiotic.fi/vault/0x4f7EA018239FfBdCf52133B9E98a498B2B4b9F32",
    showExposure: false,
    fallback: {
      asset: "USDC",
      apy: null,
      tvlUsd: null,
      exposure: [],
    },
  },
];

/** Well-known ERC-20 addresses → symbol, used when an API only returns an address. */
export const knownAssets: Record<string, string> = {
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH",
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC",
};
