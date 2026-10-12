# Presto Digital — Onchain Curator

Standalone landing site for Presto Digital's vault-curation business, built from the Figma file
`07.Presto Digital-web wip` (page **curation business**, frame **main**, 1920 × 6418).

Single page: Hero → Vaults (live data) → Managed by Presto → News → Partners → Contact → Footer.

- Next.js 16 (App Router, React Compiler) · React 19 · TypeScript · Tailwind CSS 4 · Motion
- **No CMS, no database, no email provider.** Deploys to Vercel with zero environment variables.
- Vault APY / TVL / collateral are fetched server-side from the Morpho and Symbiotic APIs and
  cached for 5 minutes (ISR). If an API is unreachable the card falls back to static values.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
pnpm lint && pnpm typecheck
```

Node 20+ and pnpm 10 are expected (`packageManager` is pinned in `package.json`).

## Editing content

Everything that is not design lives in two files:

| File                 | What it holds                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `src/data/site.ts`   | Hero copy, section titles, stats, news items, partner logos, contact email, footer links     |
| `src/data/vaults.ts` | The vaults shown in the Vaults section — protocol, address, chain, app link, fallback values |

Adding a vault = adding an entry to `src/data/vaults.ts`. Morpho vaults must be **Vault V2**
(`vaultV2ByAddress`); for V1 MetaMorpho vaults the query in `src/lib/vaults.ts` would need the
`vaultByAddress` / `state { netApy totalAssetsUsd allocation { … } }` shape instead.

News thumbnails are plain images under `public/images/news/` (425 × 239 in the design). The
current thumbnail is an SVG recreation of the "Presto | Morpho — Curator Announcement" card used
in the Figma file.

## Live vault data

| Vault                         | Source                                                                         | Fields used                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Presto USDC Forte / Prime     | `POST https://api.morpho.org/graphql` (public, no key)                         | `netApy`, `totalAssetsUsd`, `asset.symbol`, collateral caps (`caps.items[].data.collateralToken`) |
| Presto USDC Vault (Symbiotic) | `GET https://app.symbiotic.fi/api/v3/vaults` (the app's own API, undocumented) | `rewards.apr`, `tvl`, `collateral`, `adapters[].meta`                                             |

Both calls run in `src/lib/vaults.ts` on the server only, in parallel, with an 8 s timeout. The
Symbiotic endpoint is not an official public API, so the parser is defensive and any shape change
degrades to the fallback values rather than breaking the page. The APY shown for the Symbiotic vault
is the rewards APR reported by that API.

Optional environment variables (see `.env.example`): `MORPHO_API_URL`, `SYMBIOTIC_API_URL`,
`VAULT_REVALIDATE_SECONDS`, `NEXT_PUBLIC_SITE_URL`.

## Design fidelity notes

- Typography, spacing and colours were taken from the Figma file via "Copy as code → CSS (all
  layers)" (the file is view-only, so values were read rather than exported). Section titles are
  64 px / −2 % tracking, lead text 32 px, stat numbers 120 px with the black→orange text gradient.
  Values are exact at ≥ 1920 px and scale down with `clamp()` on smaller screens.
- The hero background is the same looping gradient clip the Figma file uses (`Comp 2_1.mp4`),
  reused from the existing Presto Digital site as `hero.webm/mp4` (+ 720p mobile encode).
- Partner logos (Morpho, Symbiotic, BitGo) and the Presto Digital wordmark are the exact vectors
  from the Figma file.
- The Figma file is desktop-only. Tablet and mobile layouts (stacked cards, wrapped footer, smaller
  type) are this implementation's own.
- Figma shows an `ETHEREUM / USDT` tag pair; the vaults are USDC, so the asset tag is driven by the
  API (`USDC`).
- Fonts: Die Grotesk B (400/500/700) and Pretendard Variable, both reused from the existing site.
  The Figma file also references "Die Grotesk A" for the APY/TVL labels; Die Grotesk B is used
  everywhere since A is not available in the repo.

## Things to confirm before launch

- **News copy** in `src/data/site.ts` is placeholder editorial text (the Figma uses lorem ipsum).
  The facts are taken from Presto's Morpho forum post, but the wording should be reviewed by comms.
- **Footer policy links** point at `https://www.prestolabs.io/{privacy,complaints,…}` — update
  `site.mainSiteUrl` or the individual hrefs to the real pages.
- **Stats** ("$2B+", "70M+", …) are copied from the design; confirm the numbers.
- The small disclaimer under the vault cards ("Figures are informational…") is not in the design;
  remove it in `src/components/sections/Vaults.tsx` if legal does not want it.

## Deployment

Push to a Git repository and import it in Vercel — no settings are required. The page is static
with ISR (`revalidate = 300`), so vault numbers refresh at most every 5 minutes without a redeploy.
