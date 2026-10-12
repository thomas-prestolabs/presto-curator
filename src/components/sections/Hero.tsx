import { hero } from "@/data/site";
import HeroVideo from "./HeroVideo";
import Reveal from "../ui/Reveal";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[640px] items-center justify-center overflow-hidden px-6 md:min-h-[720px] md:px-10"
      style={{ height: "100svh", maxHeight: 1080 }}
    >
      <HeroVideo />

      {/* The Figma text block sits at 41 % of the 1080px frame — slightly below center. */}
      <div className="relative z-10 flex w-full max-w-[1071px] flex-col items-center gap-6 text-center md:translate-y-[3vh] md:gap-8">
        <Reveal distance={16}>
          <h1 className="text-display font-normal text-black">
            {hero.headline.map((line, i) => (
              <span key={i} className="md:block">
                {line}
                {i < hero.headline.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
        </Reveal>
        <Reveal delay={0.15} distance={16}>
          <p className="text-lead leading-[1.4] text-black">{hero.subline}</p>
        </Reveal>
      </div>
    </section>
  );
}
