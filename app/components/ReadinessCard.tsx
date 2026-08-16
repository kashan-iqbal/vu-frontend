"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock, Target, TrendingUp } from "lucide-react";
import { getReadiness, type TopicToFix } from "@/lib/api/readiness.api";

const examLabel = (t: string) => (t === "finalterm" ? "Final Term" : "Midterm");

export default function ReadinessCard({
  code,
  examType,
}: {
  code: string;
  examType: string;
}) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["readiness", code, examType],
    queryFn: () => getReadiness(code, examType),
    staleTime: 30 * 1000,
    retry: 0,
  });

  if (isPending) {
    return (
      <div className="mt-8 flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-900" />
      </div>
    );
  }

  // Readiness is a bonus surface — if it errors, stay quiet rather than alarm.
  if (isError || !data) return null;

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm sm:p-8">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-teal-600">
        <TrendingUp className="h-4 w-4" />
        Exam Readiness · {code} {examLabel(examType)}
      </div>

      {data.status === "insufficient" ? (
        <div className="py-4">
          <p className="text-lg font-bold text-blue-900">
            Keep quizzing to unlock your score
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Answer a few more questions ({data.attempts}/{data.minAttempts}) and
            we&apos;ll predict how ready you are for this exam.
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-teal-500 transition-all"
              style={{
                width: `${Math.min(100, (data.attempts / data.minAttempts) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Headline number + band (free) */}
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <div className="text-5xl font-bold text-blue-900 sm:text-6xl">
                {data.readiness}%
              </div>
              <div className="text-sm text-slate-500">Readiness</div>
            </div>
            {data.band && (
              <div className="pb-2">
                <div className="text-lg font-semibold text-slate-700">
                  {data.band.low}–{data.band.high}%
                </div>
                <div className="text-sm text-slate-500">Predicted score band</div>
              </div>
            )}
          </div>

          {/* Topic breakdown (gated) */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Target className="h-4 w-4 text-teal-500" />
              Topics costing you the most marks
            </div>
            {data.breakdown.locked ? (
              <LockedTeaser />
            ) : data.breakdown.topics && data.breakdown.topics.length > 0 ? (
              <ul className="space-y-3">
                {data.breakdown.topics.map((t) => (
                  <TopicRow key={t.topic} t={t} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No weak spots — you&apos;re on top of every tested topic. 🎉
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TopicRow({ t }: { t: TopicToFix }) {
  const pct = Math.round(t.accuracy * 100);
  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-blue-900">{t.topic}</span>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            pct < 50
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {pct}% accuracy
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{t.fixPlan}</p>
    </li>
  );
}

function LockedTeaser() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="pointer-events-none select-none space-y-2 blur-sm">
        <div className="h-4 w-2/3 rounded bg-slate-300" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-300" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        <Lock className="h-5 w-5 text-blue-900" />
        <p className="text-sm font-semibold text-blue-900">
          Unlock your topic-by-topic fix plan
        </p>
      </div>
    </div>
  );
}
