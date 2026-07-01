import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

export interface TopicReviewItem {
  topic: string;
  explanation: string;
  missedCount: number;
}

export interface TopicReviewResponse {
  code: string;
  type: string;
  topics: TopicReviewItem[];
}

// Fetches AI explanations for the user's weak topics in a quiz.
// AI generation across several topics can take a while, so we override the
// browser client's default 10s timeout for this call.
export async function getTopicReview(
  quizCode: string,
): Promise<TopicReviewResponse> {
  const { data } = await browserClient.get(
    ENDPOINTS.topicReview.get(quizCode),
    { timeout: 60000 },
  );
  return data;
}
