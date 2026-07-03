/**
 * Central SEO / site configuration.
 *
 * Product: ExamPrep AI — an independent, AI-powered exam-preparation platform
 * for Virtual University of Pakistan (VU) students. It is NOT affiliated with
 * Virtual University; that disclaimer lives in the footer / privacy / terms.
 *
 * IMPORTANT: set NEXT_PUBLIC_SITE_URL in your environment to the real
 * production origin (the chosen domain is https://vuexamprep.com). It is used
 * as `metadataBase` and to build absolute canonical, OpenGraph, sitemap and
 * robots URLs. The fallback is only a safe default for local development.
 */
export const siteConfig = {
  name: "ExamPrep AI",
  // No trailing slash. Override per environment via NEXT_PUBLIC_SITE_URL.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vuexamprep.com").replace(
    /\/$/,
    "",
  ),
  tagline: "AI Exam Preparation for Virtual University (VU) Students",
  // Kept close to ~155 chars for search-result display; "independent" signals
  // the non-affiliation stance without over-claiming.
  description:
    "Independent AI-powered exam prep for Virtual University (VU) students: adaptive MCQ practice, past MCQs, AI topic explanations and course handouts. Not affiliated with VU.",
  locale: "en_PK",
  supportEmail: "support@vuexamprep.com",
} as const;

/** Absolute URL helper. Accepts a path like "/blog" or a full URL. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
