import { footer } from "@/data/site";
import Logo from "./ui/Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-12 px-6 pt-12 pb-16 md:px-10 lg:flex-row lg:items-start lg:justify-between lg:pt-16 lg:pb-[120px] xl:px-0">
        <a
          href="#top"
          aria-label="Presto Digital — back to top"
          className="inline-flex self-start opacity-60 transition-opacity hover:opacity-90"
        >
          <Logo color="white" width={168} height={32} />
        </a>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-10 gap-y-5 lg:gap-x-[60px] lg:pt-1.5"
        >
          {footer.links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base leading-none tracking-[0.02em] text-white capitalize transition-colors hover:text-white/70"
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/20">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center px-6 md:px-10 xl:px-0">
          <p className="text-base leading-none tracking-[0.02em] text-white/50 capitalize">
            {footer.copyright} © {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
