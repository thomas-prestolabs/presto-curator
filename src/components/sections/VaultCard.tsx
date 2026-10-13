import type { VaultData } from "@/lib/vaults";
import { formatApy, formatUsdCompact } from "@/lib/format";
import TokenIcon from "../ui/TokenIcon";

function ExposureIcons({ items }: { items: VaultData["exposure"] }) {
  if (!items.length) return null;
  return (
    <ul className="flex items-center" aria-label="Collateral exposure">
      {items.slice(0, 6).map((item, i) => (
        <li
          key={`${item.symbol}-${i}`}
          className="relative -ml-2.5 first:ml-0"
          style={{ zIndex: items.length - i }}
        >
          <TokenIcon symbol={item.symbol} logoURI={item.logoURI} className="ring-2 ring-card" />
        </li>
      ))}
    </ul>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: "chain" | "asset" }) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-base leading-[1.6] tracking-[0.02em] text-black uppercase ${
        tone === "chain" ? "bg-orange/30" : "bg-sky"
      }`}
    >
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 2xl:max-w-[180px]">
      <dt className="text-base leading-[1.6] tracking-[0.02em] text-black">{label}</dt>
      <dd className="text-2xl leading-[1.6] font-bold tracking-[0.02em] text-black">{value}</dd>
    </div>
  );
}

export default function VaultCard({ vault }: { vault: VaultData }) {
  return (
    <a
      href={vault.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${vault.protocolLabel} ${vault.name} vault — opens ${vault.protocolLabel} app`}
      className="group flex min-h-[340px] min-w-0 flex-1 flex-col justify-center rounded-xl bg-card px-6 pt-7 pb-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] xl:px-8 2xl:px-10 2xl:pt-8 2xl:pb-4"
    >
      <div className="flex flex-col gap-2">
        <p className="text-base leading-none tracking-[0.08em] text-black uppercase">
          {vault.protocolLabel}
        </p>
        <h3 className="text-2xl leading-none font-bold tracking-[0.08em] text-black uppercase xl:text-[28px] 2xl:text-[32px]">
          {vault.name}
        </h3>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Chip tone="chain">{vault.chainLabel}</Chip>
        <Chip tone="asset">{vault.asset}</Chip>
      </div>

      {/* Keep the row height when a vault shows no icons so APY/TVL line up across cards. */}
      <div className="mt-4 h-10">
        {vault.exposure.length > 0 && <ExposureIcons items={vault.exposure} />}
      </div>

      <dl className="mt-8 flex gap-4">
        <Stat label="APY" value={formatApy(vault.apy)} />
        <Stat label="TVL" value={formatUsdCompact(vault.tvlUsd)} />
      </dl>
    </a>
  );
}
