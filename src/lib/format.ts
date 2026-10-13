/**
 * Number formatting that reproduces what app.morpho.org and app.symbiotic.fi
 * display, so the card never disagrees with the linked vault page.
 *
 * The two apps round differently (both checked against the live pages):
 *   - Morpho TRUNCATES to two decimals: netApy 0.0441595 → "4.41%" (2026-10-12).
 *   - Symbiotic ROUNDS to two decimals: weeklyApr 0.0436966 → "4.37%",
 *     TVL 999809.257 → "$999.81k" (2026-10-13).
 */
export type Rounding = "trunc" | "round";

/** Which rule each app uses; pass `roundingFor[vault.protocol]` to the formatters. */
export const roundingFor: Record<"morpho" | "symbiotic", Rounding> = {
  morpho: "trunc",
  symbiotic: "round",
};

function fixed(value: number, decimals: number, mode: Rounding): string {
  const factor = 10 ** decimals;
  const scaled =
    mode === "round"
      ? Math.round((value + Number.EPSILON * Math.sign(value)) * factor)
      : Math.trunc(value * factor);
  return (scaled / factor).toFixed(decimals);
}

/** 0.0441595 → "4.41%" (trunc) · 0.0436966 → "4.37%" (round) */
export function formatApy(value: number | null, mode: Rounding = "trunc"): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${fixed(value * 100, 2, mode)}%`;
}

/** 4032325.25 → "$4.03M", 302486.05 → "$302.48k" (trunc) · 999809.26 → "$999.81k" (round) */
export function formatUsdCompact(value: number | null, mode: Rounding = "trunc"): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${fixed(value / 1e9, 2, mode)}B`;
  if (abs >= 1e6) return `$${fixed(value / 1e6, 2, mode)}M`;
  if (abs >= 1e3) return `$${fixed(value / 1e3, 2, mode)}k`;
  return `$${fixed(value, 2, mode)}`;
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
