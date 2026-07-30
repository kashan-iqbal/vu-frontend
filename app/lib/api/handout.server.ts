import "server-only";
import { cache } from "react";
import type { Handout } from "./handout.api";

/**
 * Server-side handout fetchers used for SSG/ISR and the sitemap.
 *
 * Both backend endpoints used here are public (no cookie required), so
 * rendering this on the server exposes nothing that the browser wasn't already
 * fetching client-side — it only puts the content where crawlers can read it.
 *
 * Every call is resilient: if the API is unreachable at build time the build
 * still succeeds, and pages/sitemap entries fill in on the next revalidation.
 */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3030/api/v1"
).replace(/\/$/, "");

// Handout summaries change rarely; refresh once a day without a redeploy.
const REVALIDATE_SECONDS = 86_400;

export interface HandoutKey {
  code: string;
  examType: string;
}

export const EXAM_TYPES = ["midterm", "finalterm"] as const;
export type ExamTypeValue = (typeof EXAM_TYPES)[number];

export function isExamType(value: string): value is ExamTypeValue {
  return (EXAM_TYPES as readonly string[]).includes(value);
}

/**
 * Every { code, examType } pair that actually HAS a handout. This — not the
 * static course catalogue — is what drives the generated pages and the sitemap,
 * so we never publish an empty page. Returns [] if the API is unavailable.
 */
export async function listHandoutKeys(): Promise<HandoutKey[]> {
  try {
    const res = await fetch(`${API_BASE}/handout`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["handouts"] },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter(
      (h): h is HandoutKey =>
        typeof h?.code === "string" && isExamType(h?.examType),
    );
  } catch {
    // API unreachable (e.g. building without the backend up) — degrade to no
    // pre-rendered handout routes rather than failing the build.
    return [];
  }
}

/**
 * A single handout's content, or null when it doesn't exist (404) or the API is
 * down. Wrapped in React `cache()` so `generateMetadata` and the page component
 * share ONE request — they can never disagree (no "200 body + noindex head"),
 * and it halves calls to the rate-limited backend.
 */
export const getHandoutContent = cache(async function getHandoutContent(
  code: string,
  examType: string,
): Promise<Handout | null> {
  try {
    const res = await fetch(
      `${API_BASE}/handout/${encodeURIComponent(code)}/${encodeURIComponent(examType)}`,
      { next: { revalidate: REVALIDATE_SECONDS, tags: ["handouts"] } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Handout | null;
    return data?.content ? data : null;
  } catch {
    return null;
  }
});
