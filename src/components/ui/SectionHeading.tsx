import Reveal from "./Reveal";

type SectionHeadingProps = {
  title: string;
  /** Each entry is rendered on its own line on desktop */
  subtitle?: string | string[];
  id?: string;
  className?: string;
};

/**
 * Centered section title (64px, -2% tracking) with an optional 32px subtitle,
 * matching the Vaults / Managed by Presto / News / Partners headers.
 */
export default function SectionHeading({
  title,
  subtitle,
  id,
  className = "",
}: SectionHeadingProps) {
  const lines = subtitle == null ? [] : Array.isArray(subtitle) ? subtitle : [subtitle];

  return (
    <Reveal className={`flex flex-col items-center text-center ${className}`}>
      <h2 id={id} className="text-display font-normal text-black">
        {title}
      </h2>
      {lines.length > 0 && (
        <p className="mt-6 max-w-[810px] text-lead leading-[1.6] text-black lg:mt-20">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
      )}
    </Reveal>
  );
}
