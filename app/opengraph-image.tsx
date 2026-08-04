import { ImageResponse } from "next/og";
import { siteConfig } from "./lib/seo/site";

// Site-wide default Open Graph / Twitter card. Next.js auto-emits both
// `og:image` and `twitter:image` (summary_large_image) from this file, so any
// page without its own opengraph-image inherits this branded 1200×630 card.
// This matters most on WhatsApp / Facebook, the main channels VU students use
// to share resources — a blank card there is a direct CTR loss.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The app "Correct" badge, reused from the favicon/apple-icon for brand
// consistency. Inlined so the OG render has no external asset dependency.
const badge =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
  "<rect width='64' height='64' rx='12' fill='#1e3a8a'/>" +
  "<path d='M32 16 L47 22 L32 28 L17 22 Z' fill='#ffffff'/>" +
  "<path d='M26 26 L26 30 Q32 32.5 38 30 L38 26' fill='none' stroke='#ffffff' stroke-width='2.2' stroke-linecap='round'/>" +
  "<path d='M47 22 L47 29' stroke='#2dd4bf' stroke-width='1.8' stroke-linecap='round'/>" +
  "<circle cx='47' cy='30.5' r='1.9' fill='#2dd4bf'/>" +
  "<path d='M22 41 L29 48 L44 34' fill='none' stroke='#2dd4bf' stroke-width='4.2' stroke-linecap='round' stroke-linejoin='round'/>" +
  "</svg>";

export default function OpengraphImage() {
  const badgeSrc = `data:image/svg+xml;utf8,${encodeURIComponent(badge)}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0f1e4d 0%, #1e3a8a 60%, #0d9488 160%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width="96" height="96" src={badgeSrc} alt="" />
          <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {siteConfig.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
            }}
          >
            AI Exam Prep for Virtual University (VU) Students
          </span>
          <span style={{ fontSize: 32, fontWeight: 500, color: "#a5f3ea", maxWidth: "920px" }}>
            Adaptive MCQ practice · Past MCQs · AI explanations · Course handouts
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: 28, fontWeight: 600, color: "#2dd4bf" }}>
            {siteConfig.url.replace(/^https?:\/\//, "")}
          </span>
          <span style={{ fontSize: 24, color: "#c7d2fe" }}>
            · Independent, not affiliated with VU
          </span>
        </div>
      </div>
    ),
    size,
  );
}
