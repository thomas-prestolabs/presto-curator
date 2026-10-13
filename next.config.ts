import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // News items are read from content/news at build and regeneration time;
  // include the folder in the serverless bundle so ISR can read it on Vercel.
  outputFileTracingIncludes: {
    "/": ["./content/news/**/*"],
  },
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
