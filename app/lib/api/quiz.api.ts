import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";
import type { Question } from "@/components/QuizTaker";

// The quiz the server hands out. Options arrive pre-shuffled and the answer key
// is NOT included — `correctAnswer` and `explanation` stay on the server until an
// answer is graded. `attemptId` identifies this sitting for grading and submit.
export interface DeliveredQuiz {
  attemptId: string;
  code: string;
  type: string;
  questions: Question[];
}

// Client-side quiz fetch — hits the API directly from the browser (visible in the
// Network tab).
export async function getQuizByCode(quizCode: string): Promise<DeliveredQuiz> {
  const { data } = await browserClient.get(ENDPOINTS.quiz.getByCode(quizCode));
  return data;
}

// The verdict for one answer, decided server-side. `correctOption` is an index
// into the options as they were SHOWN to this student (the shuffle is per attempt).
export interface GradedAnswer {
  correct: boolean;
  correctOption: number;
  explanation: string;
}

// POST /quiz/answer — graded as the student commits to each choice. This is what
// keeps the instant correct/wrong reveal working without the answer key ever
// reaching the browser ahead of time.
export async function gradeAnswer(params: {
  attemptId: string;
  id: number;
  selectedOption: number;
}): Promise<GradedAnswer> {
  const { data } = await browserClient.post(ENDPOINTS.quiz.answer, params);
  return data;
}

export interface QuizResult {
  message: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  wrongTopics: string[];
}

// POST /quiz/submitQuiz — names the attempt and nothing else. The score is built
// entirely from what the server recorded per answer, so it cannot be forged.
export async function submitQuiz(attemptId: string): Promise<QuizResult> {
  const { data } = await browserClient.post(ENDPOINTS.quiz.submitQuiz, {
    attemptId,
  });
  return data;
}
