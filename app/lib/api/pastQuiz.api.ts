import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

// A single past-exam MCQ as stored/returned by the backend. Note there is no
// explanation/topic field, and `correctAnswer` is a 0-based index into
// `options` (which holds 2–4 entries, e.g. ["True","False"] for boolean items).
export interface PastMcq {
  _id: string;
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: string;
  code: string;
}

// GET /pastquiz/<code>/<examType> — returns ALL matching MCQs as a bare array
// (no pagination). Large courses can return big payloads, so raise the timeout.
export async function getPastMcqs(
  code: string,
  examType: string,
): Promise<PastMcq[]> {
  const { data } = await browserClient.get(
    ENDPOINTS.pastQuiz.getByCode(code, examType),
    { timeout: 30000 },
  );
  return Array.isArray(data) ? data : [];
}
