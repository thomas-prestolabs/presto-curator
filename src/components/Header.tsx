"use client";

import { useEffect, useState } from "react";
import Logo from "./ui/Logo";
import { ArrowEast } from "./ui/Icons";

/**
 * Fixed header: logo top-left (20px inset), CONTACT pill top-right (12px inset),
 * as in the Figma GNB. Transparent over the hero video; gains a translucent
 * white backdrop once the user scrolls past the hero so it stays legible.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${
        scrolled
          ? "bg-white/80 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="relative h-full">
        <a
          href="#top"
          aria-label="Presto Digital — back to top"
          className="absolute top-5 left-5 inline-flex transition-opacity hover:opacity-70"
        >
          <Logo width={105} height={20} />
        </a>

        <a
          href="#contact"
          className="group absolute top-3 right-3 inline-flex h-10 items-center gap-1 rounded-full bg-black py-2.5 pr-[18px] pl-5 text-xs font-medium tracking-[0.08em] text-white uppercase transition-colors hover:bg-gray-90"
        >
          Contact
          <ArrowEast className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </div>
    </header>
  );
}
