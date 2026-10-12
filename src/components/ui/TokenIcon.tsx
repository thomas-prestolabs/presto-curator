"use client";

import Image from "next/image";
import { useState } from "react";

type TokenIconProps = {
  symbol: string;
  logoURI?: string;
  size?: number;
  className?: string;
};

/**
 * Round token / protocol icon. Third-party CDNs (Morpho, GitHub) serve SVG and
 * PNG logos of unknown size, so the image is rendered unoptimized and falls
 * back to the symbol's initials if it cannot be loaded.
 */
export default function TokenIcon({ symbol, logoURI, size = 40, className = "" }: TokenIconProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoURI) && !failed;

  return (
    <span
      title={symbol}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-20 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={logoURI!}
          alt={symbol}
          width={size}
          height={size}
          unoptimized
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-label={symbol}
          className="text-[11px] leading-none font-medium tracking-wide text-gray-70 uppercase"
        >
          {symbol.replace(/^w/, "").slice(0, 3)}
        </span>
      )}
    </span>
  );
}
