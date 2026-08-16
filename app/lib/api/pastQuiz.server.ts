import "server-only";
import { cache } from "react";

/**
 * Server-side past-paper MCQ fetchers for the public /past-papers SSG pages +
 * sitemap. Both endpoints are public (no cookie) and resilient: a transient
 * backend failure (429/5xx/network) is retried rather than mistaken for "no
 * content", so a throttled build never freezes a page as empty/noindex. Mirrors
 * the handout fetchers (see handout.server.ts).
 */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3030/api/v1"
).replace(/\/$/, "");

const REVALIDATE_SECONDS = 86_400;
const MAX_ATTEMPTS = 4;

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchResilient<T>(url: string, fallback: T): Promise<T> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate: REVALIDATE_SECONDS, tags: ["pastquiz"] },
      });
      if (res.status === 404) return fallback;
      if (res.ok) return (await res.json()) as T;
      if (attempt < MAX_ATTEMPTS - 1) {
        const ra = Number(res.headers.get("retry-after"));
        await sleep(Number.isFinite(ra) ? Math.min(ra * 1000, 8_000) : Math.min(300 * 2 ** attempt, 8_000));
        continue;
      }
      return fallback;
    } catch {
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(Math.min(300 * 2 ** attempt, 8_000));
        continue;
      }
      return fallback;
    }
  }
  return fallback;
}

/** Every { code, examType } pair that has past-paper MCQs (count-gated server-side). */
export async function listPastQuizKeys(): Promise<PastQuizKey[]> {
  const data = await fetchResilient<unknown>(`${API_BASE}/pastquiz`, []);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (k): k is PastQuizKey =>
      typeof k?.code === "string" && isExamType(k?.examType),
  );
}

/** All past-paper MCQs for one course + exam type. `cache()` dedupes the
 *  metadata + page render into one backend call. Returns [] when absent/down. */
export const getPastMcqs = cache(async function getPastMcqs(
  code: string,
  examType: string,
): Promise<PastMcq[]> {
  const url = `${API_BASE}/pastquiz/${encodeURIComponent(code)}/${encodeURIComponent(examType)}`;
  const data = await fetchResilient<unknown>(url, []);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (m): m is PastMcq =>
      typeof m?.question === "string" && Array.isArray(m?.options),
  );
});
