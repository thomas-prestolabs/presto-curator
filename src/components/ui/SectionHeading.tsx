import Reveal from "./Reveal";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
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
  return (
    <Reveal className={`flex flex-col items-center text-center ${className}`}>
      <h2 id={id} className="text-display font-normal text-black">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-6 w-full max-w-[810px] text-lead leading-[1.6] text-black lg:mt-20 lg:max-w-none">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
