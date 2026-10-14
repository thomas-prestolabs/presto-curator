import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/data/site";
import { Analytics } from "@vercel/analytics/next";

const dieGroteskB = localFont({
  src: [
    { path: "./fonts/die-grotesk-b-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/die-grotesk-b-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/die-grotesk-b-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-die-grotesk",
  display: "swap",
});

const pretendard = localFont({
  src: [{ path: "./fonts/PretendardStdVariable.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-pretendard",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.title,
  description: site.description,
  openGraph: {
    type: "website",
    locale: "en",
    title: site.title,
    description: site.description,
    siteName: "Presto Digital",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dieGroteskB.variable} ${pretendard.variable}`}>
      <body className="flex min-h-dvh flex-col overflow-x-hidden font-sans antialiased">
        {/* Scroll-reveal animations start from opacity 0; keep content visible without JS. */}
        <noscript>
          <style>{`[style*="opacity"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
