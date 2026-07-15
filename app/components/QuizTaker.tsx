"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  playCorrect,
  playWrong,
  preloadQuizSounds,
  useSoundEnabled,
  setSoundEnabled,
} from "@/lib/sound";
import {
  submitQuiz,
  type QuizResult,
  type QuizSubmissionItem,
} from "@/lib/api/quiz.api";

export type Question = {
  _id?: string;
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic_name: string;
  code: string;
  type: string;
};

type QuizDetail = {
  name: string;
  passScore: number;
  durationMinutes: number;
};

export default function QuizTaker({
  questions,
  detail,
  onRestart,
  quizCode,
}: {
  questions: Question[];
  detail: QuizDetail;
  onRestart: () => void;
  quizCode: string;
}) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(detail.durationMinutes * 60);
  // Mobile shows the explanation in a popup instead of inline.
  const [explanationOpen, setExplanationOpen] = useState(false);
  const isMobile = useIsMobile();

  const soundEnabled = useSoundEnabled();

  // Fetch the answer cues up front so the first one isn't late.
  useEffect(() => {
    preloadQuizSounds();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const currentSelected = selectedAnswers[currentQuestionIndex];
  const isAnswered = currentSelected !== undefined;
  const currentCorrect = currentSelected === currentQuestion.correctAnswer;
  const isLast = currentQuestionIndex === questions.length - 1;

  const answeredCount = Object.keys(selectedAnswers).length;
  const allAnswered = answeredCount === questions.length;
  // Progress reflects how many MCQs are actually answered (not just visited).
  const progress = Math.round((answeredCount / questions.length) * 100);

  const localCorrectCount = Object.entries(selectedAnswers).filter(
    ([index, answer]) => questions[parseInt(index)].correctAnswer === answer,
  ).length;

  // ── Submit the whole quiz to the backend ──
  const finishQuiz = useCallback(async () => {
    if (submitting || showResults) return;
    setSubmitting(true);

    const payload: QuizSubmissionItem[] = questions.map((q, i) => ({
      ...q,
      selectedOption: selectedAnswers[i] ?? -1, // -1 = left unanswered (e.g. timeout)
    }));

    try {
      const res = await submitQuiz(payload);
      setResult(res);
    } catch (e) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit quiz.",
      );
    } finally {
      setSubmitting(false);
      setShowResults(true);
    }
  }, [submitting, showResults, questions, selectedAnswers]);

  // ── Countdown timer → auto-submit when it hits 0 ──
  useEffect(() => {
    if (showResults) return;
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, showResults, finishQuiz]);

  const goTo = (index: number) => {
    setExplanationOpen(false);
    setCurrentQuestionIndex(index);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    // Lock the answer once chosen so the correct/wrong reveal stays stable.
    if (selectedAnswers[currentQuestionIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
    // Audio cue alongside the visual reveal. Fired straight from the click so
    // the browser lets the AudioContext start.
    if (optionIndex === currentQuestion.correctAnswer) {
      playCorrect();
    } else {
      playWrong();
    }
    // On phones the explanation lives in a popup — open it on selection.
    if (isMobile) setExplanationOpen(true);
  };

  const handleNext = () => {
    if (!isLast) goTo(currentQuestionIndex + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) goTo(currentQuestionIndex - 1);
  };

  // ════════════════════════ RESULTS ════════════════════════
  if (showResults) {
    const total = result?.totalQuestions ?? questions.length;
    const correct = result?.correct ?? localCorrectCount;
    const wrong = result?.wrong ?? total - correct;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percentage >= detail.passScore;
    const wrongTopics = result?.wrongTopics ?? [];

    return (
      <div className="min-h-screen bg-white px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative mx-auto mb-8 h-40 w-40 sm:h-48 sm:w-48">
            <svg
              className="h-full w-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#E8EEF5"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={passed ? "#4A90A4" : "#DC2626"}
                strokeWidth="8"
                strokeDasharray={`${(percentage / 100) * 282.7} 282.7`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-blue-900 sm:text-5xl">
                {percentage}%
              </div>
              <div className="text-slate-600">Score</div>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-blue-900 sm:text-4xl">
            {passed ? "Excellent Performance! 🎉" : "Keep Practicing"}
          </h1>

          <div className="my-8 grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:gap-6 sm:p-8">
            <div>
              <div className="text-2xl font-bold text-teal-600 sm:text-3xl">
                {correct}
              </div>
              <div className="text-sm text-slate-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 sm:text-3xl">
                {wrong}
              </div>
              <div className="text-sm text-slate-600">Incorrect</div>
            </div>
            <div>
              <div
                className={`text-2xl font-bold sm:text-3xl ${passed ? "text-teal-600" : "text-red-600"}`}
              >
                {percentage}%
              </div>
              <div className="text-sm text-slate-600">
                {passed ? "Passed" : "Failed"}
              </div>
            </div>
          </div>

          {wrongTopics.length > 0 && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left sm:p-6">
              <p className="mb-3 font-semibold text-amber-900">
                Topics to review
              </p>
              <div className="flex flex-wrap gap-2">
                {wrongTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-800"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <Button
                onClick={() => router.push(`/topic-review/${quizCode}`)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                <Sparkles className="h-4 w-4" />
                Explain these topics with AI
              </Button>
            </div>
          )}

          <Button
            onClick={onRestart}
            className="w-full rounded-lg bg-teal-500 px-8 py-3 font-semibold text-white hover:bg-teal-600 sm:w-auto"
          >
            Retake Quiz
          </Button>
        </div>
      </div>
    );
  }

  // ════════════════════════ QUIZ ════════════════════════
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const lowTime = timeLeft <= 60;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sticky header: title + eye-catching timer + progress ── */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-blue-900 sm:text-base">
              {detail.name}
            </h1>
            <p className="text-xs text-slate-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums shadow-sm transition-colors ${
              lowTime
                ? "animate-pulse bg-red-100 text-red-700"
                : "bg-teal-500 text-white"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>
              {minutes}:{seconds}
            </span>
          </div>
        </div>

        {/* Progress bar driven by answered count */}
        <div className="h-1.5 w-full bg-slate-200">
          <div
            className="h-full bg-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            {answeredCount} of {questions.length} answered
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? "Mute answer sounds" : "Unmute answer sounds"}
              title={soundEnabled ? "Mute answer sounds" : "Unmute answer sounds"}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
            <span className="font-semibold text-teal-600">{progress}%</span>
          </div>
        </div>

        {/* ── Question card ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <h2 className="mb-6 text-lg font-bold text-blue-900 sm:text-xl md:text-2xl">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isCorrect = index === currentQuestion.correctAnswer;
              const isChosen = currentSelected === index;

              let optionCls =
                "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50";
              let badgeCls = "bg-slate-100 text-slate-600";

              if (isAnswered) {
                if (isCorrect) {
                  optionCls = "border-green-500 bg-green-50";
                  badgeCls = "bg-green-500 text-white";
                } else if (isChosen) {
                  optionCls = "border-red-500 bg-red-50";
                  badgeCls = "bg-red-500 text-white";
                } else {
                  optionCls = "border-slate-200 bg-white opacity-60";
                }
              } else if (isChosen) {
                optionCls = "border-blue-900 bg-blue-50";
                badgeCls = "bg-blue-900 text-white";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all sm:p-4 ${optionCls} ${
                    isAnswered ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badgeCls}`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-800 sm:text-base">
                    {option}
                  </span>
                  {isAnswered && isCorrect && (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                  )}
                  {isAnswered && isChosen && !isCorrect && (
                    <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Feedback + explanation, INLINE on sm+ screens ── */}
          {isAnswered && (
            <div className="mt-6 hidden rounded-xl border border-blue-200 bg-blue-50 p-4 sm:block">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                {currentCorrect ? (
                  <span className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" /> Correct!
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" /> You selected the wrong option
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-blue-900">
                <span className="font-semibold">Explanation: </span>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* ── On mobile, a button re-opens the explanation popup ── */}
          {isAnswered && (
            <button
              onClick={() => setExplanationOpen(true)}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold sm:hidden ${
                currentCorrect
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-red-300 bg-red-50 text-red-700"
              }`}
            >
              <BookOpen className="h-4 w-4" /> View Explanation
            </button>
          )}
        </div>

        {/* ── Explanation popup (mobile) ── */}
        <Dialog open={explanationOpen} onOpenChange={setExplanationOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle
                className={currentCorrect ? "text-green-700" : "text-red-700"}
              >
                <span className="flex items-center gap-2">
                  {currentCorrect ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  {currentCorrect ? "Correct!" : "You selected the wrong option"}
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                Answer explanation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm leading-relaxed text-slate-700">
              {!currentCorrect && (
                <p>
                  <span className="font-semibold text-green-700">
                    Correct answer:{" "}
                  </span>
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </p>
              )}
              <p>
                <span className="font-semibold text-blue-900">
                  Explanation:{" "}
                </span>
                {currentQuestion.explanation}
              </p>
            </div>

            <DialogClose asChild>
              <Button className="w-full bg-blue-900 font-semibold text-white hover:bg-blue-800">
                Got it
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>

        {/* ── Question navigator dots ──
            Mobile: a single swipeable strip (edge-to-edge) so any number of
            questions stays tidy. sm+: wraps onto multiple rows. */}
        <div className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {questions.map((_, index) => {
            const answered = selectedAnswers[index] !== undefined;
            const active = index === currentQuestionIndex;
            return (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-9 w-9 shrink-0 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? "bg-blue-900 text-white ring-2 ring-blue-300"
                    : answered
                      ? "bg-teal-500 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* ── Prev / Next / Submit ── */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="h-11 flex-1 rounded-lg bg-slate-200 px-5 font-semibold text-slate-900 hover:bg-slate-300 disabled:opacity-50 sm:flex-none"
          >
            Previous
          </Button>

          {allAnswered || isLast ? (
            <Button
              onClick={finishQuiz}
              disabled={!allAnswered || submitting}
              className="h-11 flex-1 gap-2 rounded-lg bg-blue-900 px-6 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-300 sm:flex-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Quiz"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="h-11 flex-1 gap-2 rounded-lg bg-teal-500 px-6 font-semibold text-white hover:bg-teal-600 disabled:bg-slate-300 sm:flex-none"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isLast && !allAnswered && (
          <p className="mt-3 text-center text-xs font-medium text-amber-600">
            Answer all questions to submit ({answeredCount}/{questions.length}).
          </p>
        )}
      </main>
    </div>
  );
}
