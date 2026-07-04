import { ImageResponse } from "next/og";

// Apple touch icon must be a raster image (Next's apple-icon file convention
// does not accept SVG), so we render the "Correct" app badge to a 180×180 PNG.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const badge =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
  "<rect width='64' height='64' fill='#1e3a8a'/>" +
  "<path d='M32 16 L47 22 L32 28 L17 22 Z' fill='#ffffff'/>" +
  "<path d='M26 26 L26 30 Q32 32.5 38 30 L38 26' fill='none' stroke='#ffffff' stroke-width='2.2' stroke-linecap='round'/>" +
  "<path d='M47 22 L47 29' stroke='#2dd4bf' stroke-width='1.8' stroke-linecap='round'/>" +
  "<circle cx='47' cy='30.5' r='1.9' fill='#2dd4bf'/>" +
  "<path d='M22 41 L29 48 L44 34' fill='none' stroke='#2dd4bf' stroke-width='4.2' stroke-linecap='round' stroke-linejoin='round'/>" +
  "</svg>";

export default function AppleIcon() {
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(badge)}`;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width="180" height="180" src={src} alt="ExamPrep AI" />
      </div>
    ),
    size,
  );
}
