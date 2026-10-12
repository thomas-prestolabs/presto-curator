import { vaultsSection } from "@/data/site";
import { getVaults } from "@/lib/vaults";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import VaultCard from "./VaultCard";

export default async function Vaults() {
  const vaults = await getVaults();
  const anyLive = vaults.some((v) => v.live);

  return (
    <section
      id="vaults"
      aria-labelledby="vaults-title"
      className="px-4 pt-16 pb-12 md:px-10 md:py-24 lg:py-[171px]"
    >
      <SectionHeading
        id="vaults-title"
        title={vaultsSection.title}
        subtitle={vaultsSection.subtitle}
      />

      <Reveal
        delay={0.1}
        className="mx-auto mt-8 max-w-[1648px] rounded-xl bg-surface p-3 md:p-8 2xl:p-[60px]"
      >
        <div className="flex flex-col gap-3 md:gap-6 lg:flex-row lg:gap-6 2xl:gap-10">
          {vaults.map((vault) => (
            <VaultCard key={vault.id} vault={vault} />
          ))}
        </div>
      </Reveal>

      <p className="mx-auto mt-4 max-w-[1648px] px-2 text-xs tracking-[0.02em] text-gray-50">
        {anyLive
          ? "Net APY and TVL are read from the Morpho and Symbiotic APIs and refreshed periodically. Figures are informational and not an offer or recommendation."
          : "Live vault data is temporarily unavailable."}
      </p>
    </section>
  );
}
