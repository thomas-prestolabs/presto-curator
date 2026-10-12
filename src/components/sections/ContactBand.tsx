import { contactSection } from "@/data/site";

/**
 * 200px band with a left-transparent → sky-blue gradient (90.62deg in Figma),
 * "Get in touch…" at 40 % black and the email address in full black.
 */
export default function ContactBand() {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className="flex min-h-[160px] items-center justify-center px-6 py-12 md:min-h-[200px]"
      style={{ background: "linear-gradient(90.62deg, rgba(179, 226, 242, 0) 0%, #b3e2f2 100%)" }}
    >
      <div className="flex flex-col items-center gap-3 text-center md:flex-row md:gap-[160px]">
        <p className="text-lead leading-none tracking-[-0.02em] text-black/40">
          {contactSection.label}
        </p>
        <a
          href={`mailto:${contactSection.email}`}
          className="text-lead leading-none tracking-[-0.02em] text-black underline-offset-8 transition-colors hover:text-orange hover:underline"
        >
          {contactSection.email}
        </a>
      </div>
    </section>
  );
}
