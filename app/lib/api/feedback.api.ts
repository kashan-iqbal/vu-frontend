import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

export interface FeedbackInput {
  rating: number; // 1–5
  comment?: string;
  context?: string; // where it was left, e.g. "quiz-results"
  reference?: string; // optional link to the thing rated, e.g. a quiz code
}

// POST /feedback — sends the user's rating (cookie auth via the shared client).
export async function submitFeedback(
  input: FeedbackInput,
): Promise<{ success: boolean; message: string }> {
  const { data } = await browserClient.post(ENDPOINTS.feedback.submit, input);
  return data;
}
