/**
 * Number formatting that reproduces what app.morpho.org and app.symbiotic.fi
 * display, so the card never disagrees with the linked vault page.
 *
 * Both apps TRUNCATE to two decimals rather than round: a net APY of
 * 0.0441595 is shown as "4.41%", not "4.42%" (checked 2026-10-12 against the
 * Presto USDC Forte page). Truncation also never overstates a yield.
 */
function truncate(value: number, decimals: number): string {
  const factor = 10 ** decimals;
  return (Math.trunc(value * factor) / factor).toFixed(decimals);
}

/** 0.0441595 → "4.41%" */
export function formatApy(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${truncate(value * 100, 2)}%`;
}

/** 4032325.25 → "$4.03M", 302480.76 → "$302.48k", 999703.87 → "$999.70k" */
export function formatUsdCompact(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${truncate(value / 1e9, 2)}B`;
  if (abs >= 1e6) return `$${truncate(value / 1e6, 2)}M`;
  if (abs >= 1e3) return `$${truncate(value / 1e3, 2)}k`;
  return `$${truncate(value, 2)}`;
}

/** "2026-07-30" → "Jul 30, 2026" (fixed locale so server and client agree) */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
