"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  CheckCircle,
  Search,
  ArrowLeft,
  RefreshCw,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoCopy } from "@/components/NoCopy";
import { getPastMcqs, type PastMcq } from "@/lib/api/pastQuiz.api";

type ExamType = "midterm" | "finalterm";

const PAGE_SIZE = 25;

export default function PastMcqsClient({ code }: { code: string }) {
  const router = useRouter();

  const [examType, setExamType] = useState<ExamType | null>(null);
  const [pendingType, setPendingType] = useState<ExamType | null>(null);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["past-mcqs", code, examType],
    queryFn: () => getPastMcqs(code, examType as ExamType),
    enabled: !!examType,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  // Reset the visible batch when the query changes.
  const handleSearch = (value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };

  const chooseExamType = (type: ExamType) => {
    setExamType(type);
    setVisibleCount(PAGE_SIZE);
  };

  const mcqs = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mcqs;
    return mcqs.filter((m) => m.question.toLowerCase().includes(q));
  }, [mcqs, search]);

  const visible = filtered.slice(0, visibleCount);

  const resetToPicker = () => {
    setExamType(null);
    setPendingType(null);
    setSearch("");
  };

  // ── Exam-type picker (shown until a type is chosen) ──
  if (!examType) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-xl">
          <div>
            <h1 className="text-xl font-semibold text-blue-900">
              Select Exam Type
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Solve real past-paper MCQs for{" "}
              <span className="font-semibold text-slate-700">{code}</span>
            </p>
          </div>

          <div className="space-y-3">
            {(["midterm", "finalterm"] as ExamType[]).map((type) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                  pendingType === type
                    ? "border-blue-900 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="examType"
                  value={type}
                  checked={pendingType === type}
                  onChange={() => setPendingType(type)}
                  className="h-4 w-4 accent-blue-900"
                />
                <span className="font-medium capitalize text-slate-700">
                  {type === "finalterm" ? "Final term" : "Midterm"}
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push("/course")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => pendingType && chooseExamType(pendingType)}
              disabled={!pendingType}
              className="flex-1 bg-blue-900 text-white hover:bg-blue-800"
            >
              Solve Past MCQs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const examLabel = examType === "finalterm" ? "Final term" : "Midterm";

  return (
    <NoCopy className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {/* ── Header ── */}
        <div className="mb-6">
          <button
            type="button"
            onClick={resetToPicker}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Change exam type
          </button>

          <h1 className="text-2xl font-bold text-blue-900 sm:text-3xl">
            Solve Past MCQs
          </h1>
          <p className="mt-1 text-slate-600">
            <span className="font-semibold">{code}</span> · {examLabel}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Real questions from previous VU papers with the correct answer
            marked — practise the ones most likely to reappear in your exam.
          </p>
        </div>

        {/* ── Loading ── */}
        {isPending && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          </div>
        )}

        {/* ── Error ── */}
        {isError && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-slate-600">
              Something went wrong loading these MCQs.
            </p>
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-blue-900 text-white hover:bg-blue-800"
            >
              {isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          </div>
        )}

        {/* ── Empty (no MCQs for this exam type) ── */}
        {!isPending && !isError && mcqs.length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <FileQuestion className="h-14 w-14 text-slate-300" />
            <div>
              <h2 className="text-lg font-bold text-slate-700">
                No past MCQs yet
              </h2>
              <p className="mt-1 text-slate-500">
                We don&apos;t have any {examLabel.toLowerCase()} MCQs for {code}{" "}
                at the moment.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={resetToPicker}
                className="w-full sm:w-auto"
              >
                Choose another exam type
              </Button>
              <Button
                onClick={() => router.push("/course")}
                className="w-full bg-blue-900 text-white hover:bg-blue-800 sm:w-auto"
              >
                Back to courses
              </Button>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {!isPending && !isError && mcqs.length > 0 && (
          <>
            {/* Search + count */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <p className="text-sm text-slate-500">
                Showing {visible.length} of {filtered.length}
                {search.trim() ? ` (filtered from ${mcqs.length})` : ""} question
                {filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                No questions match your search.
              </p>
            ) : (
              <ol className="space-y-4">
                {visible.map((mcq, i) => (
                  <McqCard key={mcq._id} mcq={mcq} number={i + 1} />
                ))}
              </ol>
            )}

            {/* Load more */}
            {visible.length < filtered.length && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="min-w-40"
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </NoCopy>
  );
}

// ── Read-only answer-key card for a single MCQ ──
function McqCard({ mcq, number }: { mcq: PastMcq; number: number }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-bold text-blue-900 sm:text-lg">
        <span className="mr-2 text-slate-400">{number}.</span>
        {mcq.question}
      </h2>

      <div className="space-y-2">
        {mcq.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          const isCorrect = index === mcq.correctAnswer;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 ${
                isCorrect
                  ? "border-green-500 bg-green-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {letter}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-800 sm:text-base">
                {option}
              </span>
              {isCorrect && (
                <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
              )}
            </div>
          );
        })}
      </div>
    </li>
  );
}
