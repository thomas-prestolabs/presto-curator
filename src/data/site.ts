/**
 * All editable copy and links for the site live here.
 * Vault configuration is in ./vaults.ts.
 */

export const site = {
  title: "Presto Digital | Onchain Curator",
  description:
    "Presto Digital curates onchain vaults built on a quant trading track record dating back to 2014, spanning crypto, Asian equities, and commodities.",
  contactEmail: "contact@prestolabs.io",
  /** Main corporate site. Policy / disclosure links below are resolved against it. */
  mainSiteUrl: "https://www.prestolabs.io",
};

export const hero = {
  headline: ["A decade of quant trading.", "Vaults built on genuine yield."],
  subline:
    "Presto Digital curates onchain vaults built on a quant trading track record dating back to 2014, spanning crypto, Asian equities, and commodities.",
};

export const vaultsSection = {
  title: "Vaults",
  subtitle:
    "Explore live Morpho vaults curated by Presto with disclosed collateral exposure, TVL, and net APY",
};

export const statsSection = {
  title: "Managed by Presto",
  subtitle: [
    "From OTC desks to onchain lending,",
    "Presto has been active across every corner of crypto",
  ],
  stats: [
    {
      label: "Daily Volume",
      description: "Delivering billions every day to the markets.",
      value: "$2B+",
    },
    {
      label: "Daily Orders",
      description: "Delivering billions every day to the markets.",
      value: "70M+",
    },
    {
      label: "Live Track Record",
      description: "Delivering billions every day to the markets.",
      value: "10yr+",
    },
    {
      label: "Active Institutional Clients",
      description: "Delivering billions every day to the markets.",
      value: "100+",
    },
  ],
};

export type NewsItem = {
  title: string;
  excerpt: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  category: string;
  /** Path under /public or an absolute URL. 425x239 in the design. */
  image: string;
  imageAlt: string;
  href?: string;
};

export const newsSection = {
  title: "News",
  items: [
    {
      title: "Presto is now live on Morpho as a vault curator.",
      excerpt:
        "Presto Digital has launched two curated USDC vaults on Morpho — Prime and Forte — bringing a decade of quantitative risk management to onchain lending. Each vault discloses its collateral exposure, TVL, and net APY in real time.",
      date: "2026-07-30",
      category: "Curator Announcement",
      image: "/images/news/morpho-curator-announcement.svg",
      imageAlt: "Curator Announcement — Presto | Morpho",
      href: "https://app.morpho.org/ethereum/curator/presto",
    },
    {
      title: "Presto USDC Forte: diversified RWA collateral, higher yield.",
      excerpt:
        "Forte targets higher USDC yield through over-collateralized private credit RWA markets, with allocations capped per collateral and a 15% performance fee.",
      date: "2026-07-12",
      category: "Vault Update",
      image: "/images/news/morpho-curator-announcement.svg",
      imageAlt: "Curator Announcement — Presto | Morpho",
      href: "https://app.morpho.org/ethereum/vault/0x68A65f315BCd3C3456d1368Ff88bC661856548E1/presto-usdc-forte",
    },
    {
      title: "Presto USDC Prime: capital preservation with instant redeemability.",
      excerpt:
        "Prime keeps USDC in blue-chip collateral markets with no performance or management fee, designed for depositors who prioritise liquidity over yield.",
      date: "2026-07-08",
      category: "Vault Update",
      image: "/images/news/morpho-curator-announcement.svg",
      imageAlt: "Curator Announcement — Presto | Morpho",
      href: "https://app.morpho.org/ethereum/vault/0x133614490896bc02C774bc3399E4Db1B6D05a2CA/presto-usdc-prime",
    },
  ] satisfies NewsItem[],
};

export const partnersSection = {
  title: "Partners",
  partners: [
    {
      name: "Morpho",
      logo: "/images/partners/morpho.svg",
      width: 266,
      height: 54,
      href: "https://morpho.org",
    },
    {
      name: "Symbiotic",
      logo: "/images/partners/symbiotic.svg",
      width: 307,
      height: 39,
      href: "https://symbiotic.fi",
    },
    {
      name: "BitGo",
      logo: "/images/partners/bitgo.svg",
      width: 207,
      height: 70,
      href: "https://www.bitgo.com",
    },
  ],
};

export const contactSection = {
  label: "Get in touch with Presto Digital",
  email: site.contactEmail,
};

export const footer = {
  columns: [
    {
      title: "Policy",
      links: [
        { name: "Data Privacy", href: `${site.mainSiteUrl}/privacy` },
        { name: "Complaints", href: `${site.mainSiteUrl}/complaints` },
        { name: "Whistleblower", href: `${site.mainSiteUrl}/whistleblower` },
        { name: "Conflict of Interest", href: `${site.mainSiteUrl}/conflict-of-interest` },
      ],
    },
    {
      title: "Etc",
      links: [
        { name: "Disclosure", href: `${site.mainSiteUrl}/disclosure` },
        {
          name: "Media Kit",
          href: "https://prestolabs.notion.site/Presto-Digital-Brand-Materials-306143b7087380cc8a3dcb13db84731a",
        },
      ],
    },
    {
      title: "Social Media",
      links: [
        { name: "X", href: "https://x.com/Presto_Labs" },
        { name: "LinkedIn", href: "https://www.linkedin.com/company/presto-official" },
        { name: "Youtube", href: "https://www.youtube.com/@presto-group" },
      ],
    },
  ],
  copyright: "Presto Digital",
};
