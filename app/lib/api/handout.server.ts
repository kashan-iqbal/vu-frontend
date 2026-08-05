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

// A 404 is the ONLY signal that a handout is genuinely absent. Any other failure
// (429 rate-limit, 5xx, network) is transient and must never be baked into a
// noindex page — so we retry it. Without this, a throttled build froze ~half the
// handout pages as noindex "not found" even though the content existed.
const MAX_ATTEMPTS = 4;

/** Sentinel: the endpoint returned 404 — the resource genuinely does not exist. */
const NOT_FOUND = Symbol("not-found");

function backoffMs(attempt: number, retryAfter: string | null): number {
  const parsed = retryAfter ? Number(retryAfter) : NaN;
  if (Number.isFinite(parsed)) return Math.min(parsed * 1000, 8_000);
  return Math.min(300 * 2 ** attempt, 8_000); // 300ms, 600, 1200, 2400…
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch JSON, distinguishing "genuinely absent" (404 → NOT_FOUND) from transient
 * failures (retried with backoff). Returns `null` only after retries are
 * exhausted, so the build still succeeds if the API is truly down — it just
 * degrades to on-demand rendering rather than freezing a wrong noindex page.
 */
async function fetchJsonResilient<T>(
  url: string,
): Promise<T | typeof NOT_FOUND | null> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate: REVALIDATE_SECONDS, tags: ["handouts"] },
      });
      if (res.status === 404) return NOT_FOUND;
      if (res.ok) return (await res.json()) as T;
      // 429 / 5xx — transient. Retry unless we're out of attempts.
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(backoffMs(attempt, res.headers.get("retry-after")));
        continue;
      }
      return null;
    } catch {
      // Network error — transient. Retry unless we're out of attempts.
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(backoffMs(attempt, null));
        continue;
      }
      return null;
    }
  }
  return null;
}

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
  // Retries transient failures so a rate-limited build doesn't silently drop
  // handout routes/sitemap entries. Degrades to [] only if the API is truly down.
  const data = await fetchJsonResilient<unknown>(`${API_BASE}/handout`);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (h): h is HandoutKey =>
      typeof h?.code === "string" && isExamType(h?.examType),
  );
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
  const url = `${API_BASE}/handout/${encodeURIComponent(code)}/${encodeURIComponent(examType)}`;
  const data = await fetchJsonResilient<Handout | null>(url);
  // NOT_FOUND (real 404) and null (transient, retries exhausted) both mean "no
  // content to render" → the page noindexes. But a transient failure is now only
  // reached after MAX_ATTEMPTS retries, so a throttled build no longer poisons a
  // page with real content.
  if (data === NOT_FOUND || data === null) return null;
  return data?.content ? data : null;
});
