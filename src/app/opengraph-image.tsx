import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hero } from "@/data/site";

export const alt = "Presto Digital — Onchain Curator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const font = await readFile(join(process.cwd(), "src/app/fonts/die-grotesk-b-medium.ttf"));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(115deg, #ff4e00 0%, #e39a7f 35%, #8fa9d8 65%, #6a86c9 100%)",
        color: "#000",
        fontFamily: "Die Grotesk B",
      }}
    >
      <div style={{ display: "flex", fontSize: 36, letterSpacing: -0.5 }}>
        Presto <span style={{ marginLeft: 10, fontWeight: 400 }}>Digital</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 72,
            lineHeight: 1,
            letterSpacing: -1.5,
          }}
        >
          {hero.headline.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, maxWidth: 980 }}>
          {hero.subline}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Die Grotesk B", data: font, weight: 500, style: "normal" }],
    }
  );
}
