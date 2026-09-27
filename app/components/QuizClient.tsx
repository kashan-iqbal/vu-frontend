"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Loader2, Upload } from "lucide-react";
import QuizTaker, { Question } from "./QuizTaker";
import { coursesBySubject } from "../data/subject";
import { getQuizByCode } from "@/lib/api/quiz.api";

type QuizType = "midterm" | "finalterm";

export default function QuizClient({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  // ── Modal state ──
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<QuizType | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  // True when the course has no questions yet → offer the tracked contribution
  // flow (upload the source PDF on the /contribute page) instead of a quiz.
  const [noContent, setNoContent] = useState(false);

  const currentCourse = Object.values(coursesBySubject)
    .flat()
    .find((c) => c.code === code);

  const detail = {
    name: currentCourse?.title ?? "Unknown Course Quiz",
    passScore: 70,
    durationMinutes: 15,
    description: `Test your knowledge on ${currentCourse?.title} with this quiz! Get instant feedback and detailed explanations for each question. Perfect for exam prep and self-assessment.`,
    totalQuestions: 10,
  };

  // ── Open modal (reset state) ──
  const handleOpenModal = () => {
    setSelectedType(null);
    setModalError(null);
    setNoContent(false);
    setShowModal(true);
  };

  // ── Called when user clicks "Start Quiz" inside modal ──
  const handleStart = async () => {
    if (!selectedType) {
      setModalError("Please select Midterm or Finalterm.");
      return;
    }

    const quizCode = `${selectedType}-${code}`; // e.g. "midterm-CS101"

    setLoading(true);
    setModalError(null);
    setNoContent(false);

    try {
      const data = await getQuizByCode(quizCode);
      setQuestions(data);
      setShowModal(false);
    } catch (e) {
      const err = e as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      // 404 = no questions for this course yet → route the student to contribute
      // its PDF (tracked) rather than showing a generic error.
      setNoContent(err.response?.status === 404);
      setModalError(
        err?.response?.data?.message || err?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Once questions loaded → hand off ──
  if (questions) {
    return (
      <QuizTaker
        questions={questions}
        detail={detail}
        onRestart={() => setQuestions(null)}
        quizCode={`${selectedType}-${code}`}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-6 sm:py-8">
      <div className="max-w-2xl mx-auto text-center px-4 w-full">
        <h1 className="text-2xl sm:text-4xl font-bold text-blue-900 mb-2 sm:mb-4">
          {detail.name}
        </h1>
        <p className="text-base sm:text-xl text-slate-600 mb-5 sm:mb-8">
          {detail.description}
        </p>

        <div className="bg-slate-50 rounded-xl p-5 sm:p-8 mb-5 sm:mb-8 border border-slate-200">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-5 sm:mb-8">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                {detail.totalQuestions}
              </div>
              <div className="text-sm sm:text-base text-slate-600">
                Questions
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                {detail.durationMinutes}
              </div>
              <div className="text-sm sm:text-base text-slate-600">Minutes</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                {detail.passScore}%
              </div>
              <div className="text-sm sm:text-base text-slate-600">
                Pass Score
              </div>
            </div>
          </div>

          <div className="text-left space-y-2 sm:space-y-3">
            <p className="font-semibold text-blue-900 mb-2 sm:mb-4">
              Quiz Features:
            </p>
            {[
              "Instant feedback on each answer",
              "Detailed explanations for all questions",
              "Performance analytics and score breakdown",
              "Review your answers after completion",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 text-sm sm:text-base text-slate-700"
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trigger button (replaces old handleStart) ── */}
        <Button
          onClick={handleOpenModal}
          className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 mx-auto"
        >
          Start Quiz
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl space-y-6">
            <h2 className="text-xl font-semibold text-blue-900">
              Select Quiz Type
            </h2>

            <div className="space-y-3">
              {(["midterm", "finalterm"] as QuizType[]).map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedType === type
                      ? "border-blue-900 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="quizType"
                    value={type}
                    checked={selectedType === type}
                    onChange={() => setSelectedType(type)}
                    className="accent-blue-900 w-4 h-4"
                  />
                  <span className="capitalize font-medium text-slate-700">
                    {type}
                  </span>
                </label>
              ))}
            </div>

            {modalError && <p className="text-sm text-red-500">{modalError}</p>}

            {noContent && (
              <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-left">
                <p className="text-sm text-blue-900">
                  This course doesn&apos;t have questions yet. Have its handout or
                  notes PDF? Contribute it and help other {code} students — we&apos;ll
                  turn it into practice questions.
                </p>
                <button
                  onClick={() => router.push(`/contribute?code=${code}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  <Upload className="h-4 w-4" /> Contribute {code} PDF
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStart}
                disabled={loading}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Start Quiz"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
