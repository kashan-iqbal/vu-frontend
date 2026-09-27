import "server-only";
import { cache } from "react";
import type { Handout } from "./handout.api";
import {
  API_BASE,
  NOT_FOUND,
  fetchContentJson,
  tryFetchContentJson,
} from "./upstream";

/**
 * Server-side handout fetchers used for SSG/ISR and the sitemap.
 *
 * Both endpoints are public (no cookie required), so rendering them on the
 * server exposes nothing the browser wasn't already fetching client-side — it
 * only puts the content where crawlers can read it.
 *
 * Failure policy lives in ./upstream.ts and is the important part: a 404 means
 * "absent" (noindex is correct), and EVERYTHING ELSE THROWS. These functions
 * deliberately no longer degrade to null/[] on a transient failure, because that
 * is exactly how ~180 pages were frozen as noindex in 2026-08.
 */

export interface HandoutKey {
  code: string;
  examType: string;
}

export const EXAM_TYPES = ["midterm", "finalterm"] as const;
export type ExamTypeValue = (typeof EXAM_TYPES)[number];

export function isExamType(value: string): value is ExamTypeValue {
  return (EXAM_TYPES as readonly string[]).includes(value);
}

function parseKeys(data: unknown): HandoutKey[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (h): h is HandoutKey =>
      typeof h?.code === "string" && isExamType(h?.examType),
  );
}

/**
 * Every { code, examType } pair that actually HAS a handout. This — not the
 * static course catalogue — drives `generateStaticParams` and the sitemap, so we
 * never publish an empty page.
 *
 * @throws UpstreamUnavailableError if the API cannot be reached. Callers that
 *         decide what exists (build params, sitemap) MUST let this propagate:
 *         silently returning [] would 404 or un-list the whole catalogue.
 */
export async function listHandoutKeys(): Promise<HandoutKey[]> {
  const data = await fetchContentJson<unknown>(`${API_BASE}/handout`, "handouts");
  if (data === NOT_FOUND) return [];
  return parseKeys(data);
}

/**
 * Lenient variant for OPTIONAL cross-linking only (e.g. "does a handout exist,
 * so should I render a link to it?"). Returns [] if the API is unreachable,
 * which merely omits a link — it cannot affect indexability.
 */
export async function tryListHandoutKeys(): Promise<HandoutKey[]> {
  const data = await tryFetchContentJson<unknown>(`${API_BASE}/handout`, "handouts", []);
  return parseKeys(data);
}

/**
 * A single handout's content, or `null` ONLY when the API returned 404.
 *
 * Wrapped in React `cache()` so `generateMetadata` and the page component share
 * one request and can never disagree (no "200 body + noindex head"), and so we
 * halve the load on a slow backend.
 *
 * @throws UpstreamUnavailableError on any transient failure, so a flaky API can
 *         never be misread as "this handout doesn't exist".
 */
export const getHandoutContent = cache(async function getHandoutContent(
  code: string,
  examType: string,
): Promise<Handout | null> {
  const url = `${API_BASE}/handout/${encodeURIComponent(code)}/${encodeURIComponent(examType)}`;
  const data = await fetchContentJson<Handout | null>(url, "handouts");
  if (data === NOT_FOUND) return null;
  // A 200 with no `content` is a real, empty record — genuinely nothing to index.
  return data?.content ? data : null;
});
