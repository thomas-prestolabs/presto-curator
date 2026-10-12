import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Token / curator logos served by the Morpho API
      { protocol: "https", hostname: "cdn.morpho.org" },
      // Vault / adapter icons referenced by the Symbiotic app API
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
