import "server-only";
import { cache } from "react";
import {
  API_BASE,
  NOT_FOUND,
  fetchContentJson,
  tryFetchContentJson,
} from "./upstream";

/**
 * Server-side past-paper MCQ fetchers for the public /past-papers SSG pages and
 * the sitemap. Both endpoints are public (no cookie).
 *
 * Mirrors handout.server.ts, including its failure policy: a 404 means absent,
 * anything else throws (see ./upstream.ts). The previous version returned the
 * `[]` fallback on a failed request, which is indistinguishable from "this course
 * has no MCQs" and therefore produced noindex pages whenever the API hiccuped.
 */

export interface PastMcq {
  _id: string;
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index into options
  type: string;
  code: string;
}

export interface PastQuizKey {
  code: string;
  examType: string;
  count: number;
}

export const EXAM_TYPES = ["midterm", "finalterm"] as const;
export type ExamTypeValue = (typeof EXAM_TYPES)[number];
export function isExamType(v: string): v is ExamTypeValue {
  return (EXAM_TYPES as readonly string[]).includes(v);
}

function parseKeys(data: unknown): PastQuizKey[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (k): k is PastQuizKey =>
      typeof k?.code === "string" && isExamType(k?.examType),
  );
}

/**
 * Every { code, examType } pair that has past-paper MCQs (count-gated by the
 * backend). Drives `generateStaticParams` and the sitemap.
 *
 * @throws UpstreamUnavailableError if the API cannot be reached — callers that
 *         decide what exists must let it propagate rather than publish nothing.
 */
export async function listPastQuizKeys(): Promise<PastQuizKey[]> {
  const data = await fetchContentJson<unknown>(`${API_BASE}/pastquiz`, "pastquiz");
  if (data === NOT_FOUND) return [];
  return parseKeys(data);
}

/**
 * Lenient variant for OPTIONAL cross-linking only (e.g. should the handout page
 * render a "solved MCQs" link?). Returns [] when unreachable, which only omits a
 * link and cannot affect indexability.
 */
export async function tryListPastQuizKeys(): Promise<PastQuizKey[]> {
  const data = await tryFetchContentJson<unknown>(`${API_BASE}/pastquiz`, "pastquiz", []);
  return parseKeys(data);
}

/**
 * All past-paper MCQs for one course + exam type. `cache()` dedupes the metadata
 * and page render into one backend call.
 *
 * @returns the MCQs, or `[]` only when the API genuinely has none (404 / empty).
 * @throws  UpstreamUnavailableError on any transient failure.
 */
export const getPastMcqs = cache(async function getPastMcqs(
  code: string,
  examType: string,
): Promise<PastMcq[]> {
  const url = `${API_BASE}/pastquiz/${encodeURIComponent(code)}/${encodeURIComponent(examType)}`;
  const data = await fetchContentJson<unknown>(url, "pastquiz");
  if (data === NOT_FOUND) return [];
  if (!Array.isArray(data)) return [];
  return data.filter(
    (m): m is PastMcq =>
      typeof m?.question === "string" && Array.isArray(m?.options),
  );
});
