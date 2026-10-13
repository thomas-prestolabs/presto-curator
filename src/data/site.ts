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

/**
 * News items are Markdown files in content/news/ (see content/news/README.md).
 * `limit` is how many of the newest items the section shows.
 */
export const newsSection = {
  title: "News",
  limit: 3,
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
  /** Flat list, rendered as one row (order matters). */
  links: [
    { name: "X", href: "https://x.com/Presto_Labs" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/presto-official" },
    { name: "Youtube", href: "https://www.youtube.com/@presto-group" },
    {
      name: "Media Kit",
      href: "https://prestolabs.notion.site/Presto-Digital-Brand-Materials-306143b7087380cc8a3dcb13db84731a",
    },
  ],
  copyright: "Presto Digital",
};
