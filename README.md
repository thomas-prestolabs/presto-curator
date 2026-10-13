# Presto Digital — Onchain Curator

Standalone landing site for Presto Digital's vault-curation business, built from the Figma file
`07.Presto Digital-web wip` (page **curation business**, frame **main**, 1920 × 6418).

Single page: Hero → Vaults (live data) → Managed by Presto → News → Partners → Contact → Footer.

- Next.js 16 (App Router, React Compiler) · React 19 · TypeScript · Tailwind CSS 4 · Motion
- **No external services required.** Content is files in the repo; deploys to Vercel with zero
  required environment variables. An Upstash Redis database is optional and recommended in
  production (last-good vault snapshot + history).
- Vault APY / TVL / collateral come from the Morpho and Symbiotic APIs, read on the server and
  cached for one minute (ISR). Page views never call the APIs directly.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
pnpm lint && pnpm typecheck
```

Node 20+ and pnpm 10 are expected (`packageManager` is pinned in `package.json`).

## Editing content

| What                                                    | Where                                                                              |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| News items                                              | `content/news/*.md` — one Markdown file per item (guide: `content/news/README.md`) |
| Hero copy, stats, partners, contact email, footer links | `src/data/site.ts`                                                                 |
| Vaults (address, chain, link, fallback)                 | `src/data/vaults.ts`                                                               |

### News

The News section shows the newest `newsSection.limit` items (3, set in `src/data/site.ts`),
sorted by the `date` in each file's front matter. Older files stay in the folder as an archive
and are not displayed; raise the limit or add an archive page if that is ever wanted.

Adding an item is adding a file — no code changes:

```markdown
---
title: "Presto USDC Forte: diversified RWA collateral, higher yield."
date: 2026-07-12
category: Vault Update
image: /images/news/forte.png
href: https://app.morpho.org/ethereum/vault/0x68A6…/presto-usdc-forte
---

Two to four sentences of excerpt go here.
```

Thumbnails go in `public/images/news/` (425 × 239 or any 16:9). On GitHub this is
**content/news → Add file → Create new file**, paste, **Commit changes**; Vercel redeploys
automatically. A missing required field or a malformed date fails the build with the file name in
the error, and the previous deployment stays live, so a typo can never take the site down or
silently drop a post.

Adding a vault = adding an entry to `src/data/vaults.ts`. Morpho vaults must be **Vault V2**
(`vaultV2ByAddress`); for V1 MetaMorpho vaults the query in `src/lib/vaults.ts` would need the
`vaultByAddress` / `state { netApy totalAssetsUsd allocation { … } }` shape instead.

## Live vault data

| Vault                         | Source                                                                         | Fields used                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Presto USDC Forte / Prime     | `POST https://api.morpho.org/graphql` (public, no key)                         | `netApy` (the "Net APY" on the vault page), `totalAssetsUsd`, `asset.symbol`, collateral caps |
| Presto USDC Vault (Symbiotic) | `GET https://app.symbiotic.fi/api/v3/vaults` (the app's own API, undocumented) | `rewards.weeklyApr` (the 7-day "APY" the app shows by default), `tvl`, `collateral`           |

How the numbers relate to the linked pages:

- **Same fields.** Verified on 2026-10-12: Morpho page "Net APY 4.54%" ↔ `netApy` 0.045409;
  Symbiotic page "APY 4.36%" ↔ `rewards.weeklyApr` 0.0436.
- **Same rounding.** Both apps truncate to two decimals instead of rounding (`0.0441595` → `4.41%`,
  not `4.42%`). `src/lib/format.ts` does the same, for APY and for USD (`$302.48k`, `$4.03M`).
- **Cached, not per view.** The page is an ISR page (`revalidate = 60`): visitors get the cached
  HTML instantly, and the first request after a window expires triggers one background
  regeneration — the only moment the Morpho / Symbiotic APIs are called. Upstream traffic is
  therefore at most one request per vault per minute, independent of visitor count (measured:
  30 page views inside one window → 0 extra upstream calls). No visitors, no calls. Morpho's
  `netApy` is an instantaneous rate, so a figure can trail the live page by up to a minute and
  differ in the second decimal; that is the trade-off of caching.
- **Keeps the last good numbers.** Every successful read is written to Redis (`vaults:latest`).
  When an API read fails — including during a deploy or build — the card renders that snapshot
  instead of "—". Without Redis configured, a runtime failure throws so Next keeps serving the
  previously generated page; only `next build` and `next dev` fall back to the static values in
  `src/data/vaults.ts`.
- **History.** A sparse record (`vaults:history`, one point per 5 minutes, kept 90 days ≈ 26k
  points) of the APY / TVL the site showed. Not displayed yet; it is the input for a future chart
  and a record of what was published.

All reads run in `src/lib/vaults.ts` on the server, in parallel, with an 8 s timeout. The
Symbiotic endpoint is not an official public API, so its parser is defensive.

### Persistent layer (Upstash Redis)

Set either pair in the Vercel project (the `KV_*` names are what the existing Presto Digital site
uses for its Upstash database, so the same database can be shared — keys are namespaced `vaults:*`):

```
UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
KV_REST_API_URL        / KV_REST_API_TOKEN
```

Redis is written at most once per regeneration (≤ 1/min) and read only when an API fails, so a
free Upstash tier is more than enough. With neither pair set the store is disabled and the site
still works. `VAULT_STORE=memory` swaps in an in-process store for local testing.

### Traffic

The design is traffic-independent: at 1,500 or 150,000 visitors a day the protocol APIs still see
at most one request per vault per minute, because visitors are served the cached page and only the
first request after a window expires triggers a regeneration. What scales with visitors is
bandwidth — the hero video (6–8 MB desktop, 2–3 MB mobile) dominates at roughly 4 MB per visit,
i.e. about 200 GB/month at 1,500 visits/day. That fits a Vercel Pro plan's included transfer; if
traffic grows several-fold, move `public/videos/*` to object storage with a CDN (Cloudflare R2,
Vercel Blob) or re-encode the clip at a lower bitrate.

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

- **News copy** in `content/news/` is placeholder editorial text (the Figma uses lorem ipsum).
  The facts are taken from Presto's Morpho forum post, but the wording should be reviewed by comms.
- **Footer policy links** point at `https://www.prestolabs.io/{privacy,complaints,…}` — update
  `site.mainSiteUrl` or the individual hrefs to the real pages.
- **Stats** ("$2B+", "70M+", …) are copied from the design; confirm the numbers.
- The small disclaimer under the vault cards ("Figures are informational…") is not in the design;
  remove it in `src/components/sections/Vaults.tsx` if legal does not want it.

## Deployment

Push to a Git repository and import it in Vercel — no settings are required. The page is static with
ISR (`revalidate = 60`), so vault numbers refresh themselves without a redeploy.
