"use client";

import Link from "next/link";
import { AlarmClock, ArrowRight } from "lucide-react";

const examLabel = (t: string) => (t === "finalterm" ? "Final Term" : "Midterm");

// Compact teaser on the quiz results screen — nudges a panicking student toward
// the full crash plan for this exact course exam.
export default function CrashPlanCard({
  code,
  examType,
}: {
  code: string;
  examType: string;
}) {
  return (
    <Link
      href={`/crash-plan/${code}/${examType}`}
      className="mt-8 flex items-center gap-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 text-left transition-colors hover:bg-teal-100"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
        <AlarmClock className="h-6 w-6 text-teal-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-blue-900">
          Exam soon? Get a {code} {examLabel(examType)} crash plan
        </p>
        <p className="text-sm text-slate-600">
          An hour-by-hour plan built around your weakest, highest-value topics.
        </p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-teal-600" />
    </Link>
  );
}
