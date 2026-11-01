import { ImageResponse } from "next/og";
import { getCourseByCode } from "@/lib/courses";
import { canonicalCourseCode } from "@/lib/courseCode";
import { siteConfig } from "@/lib/seo/site";

/**
 * Per-course Open Graph card.
 *
 * Without this, every shared handout link rendered the generic site-wide card, so
 * a CS201 link and an MGT501 link looked identical in a WhatsApp or Facebook
 * group. Those groups are the main way VU students pass resources around, and a
 * card that names the actual course is the difference between a link that gets
 * tapped and one that gets scrolled past.
 *
 * Deliberately NOT statically generated: `generateStaticParams` here would render
 * 282 images at build time for a surface most pages never need. Next renders each
 * on first request and caches it at the CDN.
 */

export const alt = "VU course handout summary and MCQ practice";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const termLabel = (t: string) => (t === "midterm" ? "Midterm" : "Final Term");

export default async function Image({
  params,
}: {
  params: Promise<{ code: string; examType: string }>;
}) {
  const { code, examType } = await params;
  const codeUpper = canonicalCourseCode(code);
  const course = getCourseByCode(codeUpper);
  const label = termLabel(examType);

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
          background:
            "linear-gradient(135deg, #0f1e4d 0%, #1e3a8a 60%, #0d9488 160%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              background: "#2dd4bf",
              color: "#0f1e4d",
              padding: "8px 20px",
              borderRadius: "999px",
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: 30, opacity: 0.85 }}>
            Virtual University
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {codeUpper}
          </span>
          {course?.title ? (
            <span
              style={{
                fontSize: 46,
                fontWeight: 600,
                lineHeight: 1.15,
                maxWidth: "980px",
                opacity: 0.95,
              }}
            >
              {course.title}
            </span>
          ) : null}
          <span style={{ fontSize: 34, opacity: 0.8 }}>
            Handout summary · Past-paper MCQs · AI topic review
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 28,
            opacity: 0.75,
          }}
        >
          <span>{siteConfig.name}</span>
          <span>vuexamprep.com</span>
        </div>
      </div>
    ),
    size,
  );
}
