import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

export interface GdbDraft {
  stance: string;
  supportingPoints: string[];
  counterpoint: string;
  conclusion: string;
  registerNote: string;
}

export interface GdbStatus {
  credits: number;
  hasPass: boolean;
  passExpiresAt: string | null;
  locked: boolean;
}

export interface GdbHelpResponse {
  draft?: GdbDraft;
  fromCache?: boolean;
  charged?: boolean;
  credits?: number;
  hasPass?: boolean;
  locked?: boolean;
  message?: string;
}

// GET /gdb/status — the student's credit balance / pass state.
export async function getGdbStatus(): Promise<GdbStatus> {
  const { data } = await browserClient.get(ENDPOINTS.gdb.status);
  return data;
}

// POST /gdb/help — cache-check → (charge) → generate → store. LLM is slow, so the
// 10s default timeout is overridden (mirrors topic-review.api.ts).
export async function postGdbHelp(question: string): Promise<GdbHelpResponse> {
  const { data } = await browserClient.post(
    ENDPOINTS.gdb.help,
    { question },
    { timeout: 60000 },
  );
  return data;
}
