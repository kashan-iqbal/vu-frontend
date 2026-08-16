import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

export interface TopicToFix {
  topic: string;
  weight: number;
  accuracy: number; // 0..1
  marksAtStake: number;
  fixPlan: string;
}

export interface Readiness {
  course: string;
  examType: string;
  status: "ready" | "insufficient";
  attempts: number;
  minAttempts: number;
  readiness: number | null; // 0..100
  band: { low: number; high: number } | null;
  message?: string;
  breakdown: {
    locked: boolean;
    topics: TopicToFix[] | null;
  };
}

// GET /readiness/<code>/<examType> — the student's readiness for one course exam.
export async function getReadiness(
  code: string,
  examType: string,
): Promise<Readiness> {
  const { data } = await browserClient.get(
    ENDPOINTS.readiness.get(code, examType),
  );
  return data;
}
