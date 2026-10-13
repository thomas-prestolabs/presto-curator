import { statsSection } from "@/data/site";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";

export default function Stats() {
  return (
    <section
      id="managed-by-presto"
      aria-labelledby="stats-title"
      className="px-4 py-16 md:px-10 md:py-24 lg:pt-[78px] lg:pb-[217px]"
    >
      <SectionHeading
        id="stats-title"
        title={statsSection.title}
        subtitle={statsSection.subtitle}
      />

      <div className="mx-auto mt-10 grid max-w-[1648px] grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-[59px] xl:grid-cols-4">
        {statsSection.stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} className="flex">
            <article className="flex min-h-[260px] w-full flex-col justify-between rounded-xl bg-card p-6 md:min-h-[360px] md:px-10 md:pt-10 md:pb-6 2xl:min-h-[480px] 2xl:pb-[22px]">
              <div>
                <h3 className="text-2xl leading-[1.2] font-medium text-black capitalize">
                  {stat.label}
                </h3>
                <p className="mt-3 font-pretendard text-base leading-[1.4] font-medium text-gray-50">
                  {stat.description}
                </p>
              </div>
              <p className="text-ember mt-10 text-stat font-medium">{stat.value}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
