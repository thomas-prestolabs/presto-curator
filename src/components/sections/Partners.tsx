import Image from "next/image";
import { partnersSection } from "@/data/site";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";

export default function Partners() {
  return (
    <section
      id="partners"
      aria-labelledby="partners-title"
      className="px-4 py-16 md:px-10 md:py-24 lg:py-[240px]"
    >
      <SectionHeading id="partners-title" title={partnersSection.title} />

      <Reveal delay={0.1}>
        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-16 gap-y-10 lg:mt-[138px] xl:gap-x-[177px]">
          {partnersSection.partners.map((partner) => (
            <li key={partner.name} className="flex h-[70px] items-center">
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={partner.name}
                className="inline-flex opacity-100 transition-opacity hover:opacity-70"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  className="h-auto max-w-[60vw] md:max-w-none"
                  style={{ width: `min(${partner.width}px, 60vw)` }}
                />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
