"use client";

import { useState } from "react";
import { FeedbackForm } from "./FeedbackForm";
import { useFeedbackDone } from "@/lib/feedback-state";

/**
 * An auto-shown feedback card for a natural moment (quiz finished, review read).
 * Renders nothing once the user has responded or dismissed anywhere — the
 * floating button remains for anyone who wants to come back to it.
 */
export function InlineFeedback({
  context,
  reference,
  title = "Enjoying ExamPrep AI?",
  subtitle = "Rate your experience — it helps us improve.",
}: {
  context: string;
  reference?: string;
  title?: string;
  subtitle?: string;
}) {
  const done = useFeedbackDone();
  const [resolved, setResolved] = useState(false);

  if (done || resolved) return null;

  return (
    <div className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center sm:p-6">
      <h3 className="text-lg font-bold text-blue-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      <div className="mt-4 text-left">
        <FeedbackForm
          context={context}
          reference={reference}
          onResolved={() => setResolved(true)}
        />
      </div>
    </div>
  );
}
