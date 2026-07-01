import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";
import type { Question } from "@/components/QuizTaker";

// Client-side quiz fetch — hits http://localhost:3030/api/v1/quiz/<quizCode>
// directly from the browser (visible in the Network tab).
export async function getQuizByCode(quizCode: string): Promise<Question[]> {
  const { data } = await browserClient.get(ENDPOINTS.quiz.getByCode(quizCode));
  return data;
}

// Upload a course PDF (multipart) — the backend emails it to the admin inbox.
// Override the instance's JSON content-type so axios sets the multipart boundary,
// and raise the timeout since uploads can be large.
export async function uploadCoursePdf(
  form: FormData,
): Promise<{ success: boolean; message: string }> {
  const { data } = await browserClient.post(ENDPOINTS.quiz.uploadPdf, form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return data;
}

// Each submitted question carries the option the user picked (`selectedOption`).
// The backend marks an answer wrong when selectedOption !== correctAnswer.
export interface QuizSubmissionItem extends Question {
  selectedOption: number;
}

export interface QuizResult {
  message: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  wrongTopics: string[];
}

// POST /quiz/submitQuiz — sends the full answered quiz once the user finishes.
export async function submitQuiz(
  answers: QuizSubmissionItem[],
): Promise<QuizResult> {
  const { data } = await browserClient.post(ENDPOINTS.quiz.submitQuiz, answers);
  return data;
}
