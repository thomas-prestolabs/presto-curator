import Image from "next/image";
import { newsSection } from "@/data/site";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { formatDate } from "@/lib/format";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";

function NewsCard({ item }: { item: NewsItem }) {
  const Wrapper = item.href ? "a" : "div";
  const linkProps = item.href
    ? { href: item.href, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="group relative flex min-h-[493px] flex-col justify-between rounded-xl border border-black/10 bg-white p-6 transition-[box-shadow,border-color] duration-300 hover:border-black/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] md:p-8"
    >
      {/* Thumbnail: 425×239 inset 46px from the top-right corner on desktop */}
      <div className="mb-6 w-full overflow-hidden rounded-[6px] bg-black lg:absolute lg:top-[46px] lg:right-[46px] lg:mb-0 lg:w-[425px]">
        <Image
          src={item.image}
          alt={item.imageAlt}
          width={425}
          height={239}
          sizes="(min-width: 1024px) 425px, 100vw"
          unoptimized={item.image.startsWith("http")}
          className="aspect-[425/239] w-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-2 lg:max-w-[700px]">
        <h3 className="text-xl leading-[1.4] font-medium text-black md:text-[28px]">
          {item.title}
        </h3>
        <p className="text-base leading-[1.4] text-gray-50">{item.excerpt}</p>
      </div>

      <p className="mt-10 flex items-center gap-1 text-base leading-none tracking-[0.02em]">
        <time dateTime={item.date} className="text-orange">
          {formatDate(item.date)}
        </time>
        <span className="text-black/50">•</span>
        <span className="text-black/50">{item.category}</span>
      </p>
    </Wrapper>
  );
}

export default async function News() {
  const items = await getLatestNews(newsSection.limit);

  return (
    <section
      id="news"
      aria-labelledby="news-title"
      className="px-4 py-16 md:px-10 md:py-24 lg:py-[120px]"
    >
      <SectionHeading id="news-title" title={newsSection.title} />

      <div className="mx-auto mt-10 flex max-w-[1240px] flex-col gap-6 lg:mt-20 lg:gap-8">
        {items.map((item, i) => (
          <Reveal key={item.slug} delay={i * 0.06}>
            <NewsCard item={item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
