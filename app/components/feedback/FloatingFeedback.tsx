"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";

// Don't cover the quiz's own sticky footer / fixed controls.
const HIDE_ON = ["/quiz/"];

/**
 * A small always-available "Feedback" tab, fixed to the bottom-right of every
 * app page. Unlike the inline prompts it ignores the "already done" flag — it's
 * the deliberate, non-nagging way to leave feedback any time.
 */
export function FloatingFeedback() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Give feedback"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-800"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-blue-900">
                  Share your feedback
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  How is your experience so far?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FeedbackForm
              context="floating"
              showDismiss={false}
              onResolved={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
