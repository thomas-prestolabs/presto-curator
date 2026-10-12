"use client";

import { useEffect, useState } from "react";

const DESKTOP = { webm: "/videos/hero.webm", mp4: "/videos/hero.mp4" };
const MOBILE = { webm: "/videos/hero-mobile.webm", mp4: "/videos/hero-mobile.mp4" };

/**
 * Looping gradient video behind the hero ("Comp 2_1.mp4" in Figma — the same
 * clip as the existing Presto Digital site hero). Serves the lighter 720p
 * encode on phones. The poster is a frame of the clip so there is no flash of
 * white before the video can play.
 */
export default function HeroVideo() {
  const [src, setSrc] = useState<typeof DESKTOP | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const pick = () => setSrc(mq.matches ? MOBILE : DESKTOP);
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#d9c7c5]">
      {src ? (
        <video
          key={src.mp4}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          aria-hidden="true"
          className="h-full w-full object-cover"
        >
          <source src={src.webm} type="video/webm" />
          <source src={src.mp4} type="video/mp4" />
        </video>
      ) : (
        // Server render / before hydration: show the poster frame.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/hero-poster.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
