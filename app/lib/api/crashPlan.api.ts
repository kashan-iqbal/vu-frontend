import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

export type CrashActivity = "study" | "quiz" | "rest" | "mock";

export interface CrashQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  topic_name: string;
}

export interface CrashBlock {
  startTime: string; // ISO
  endTime: string; // ISO
  topic: string | null;
  activityType: CrashActivity;
  whyThisMatters: string | null; // null when locked
  accuracy: number | null; // 0..1
  handoutRef: { url: string; anchor: string | null } | null;
  questions: CrashQuestion[] | null;
}

export interface CrashPlan {
  course: string;
  examType: string;
  exists: boolean;
  locked: boolean;
  hoursAvailable: number | null;
  generatedAt: string | null;
  blockCount: number;
  blocks: CrashBlock[];
}

// GET /crash-plan/<code>/<examType> — the saved plan (exists:false if none yet).
export async function getCrashPlan(
  code: string,
  examType: string,
): Promise<CrashPlan> {
  const { data } = await browserClient.get(
    ENDPOINTS.crashPlan.get(code, examType),
  );
  return data;
}

// POST /crash-plan/<code>/<examType> — build (or rebuild) and persist a plan.
export async function generateCrashPlan(
  code: string,
  examType: string,
  hoursAvailable: number,
): Promise<CrashPlan> {
  const { data } = await browserClient.post(
    ENDPOINTS.crashPlan.generate(code, examType),
    { hoursAvailable },
  );
  return data;
}
