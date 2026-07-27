"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitFeedback } from "@/lib/api/feedback.api";
import { markFeedbackDone } from "@/lib/feedback-state";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

/**
 * The shared rating widget: 1–5 stars + an optional comment. Used by both the
 * inline prompts and the floating modal.
 *
 * `onResolved` fires after a submit OR a dismiss so the host can hide itself /
 * close the modal. Submitting and dismissing both call markFeedbackDone(), so
 * the inline auto-prompts won't reappear.
 */
export function FeedbackForm({
  context,
  reference,
  onResolved,
  showDismiss = true,
}: {
  context: string;
  reference?: string;
  onResolved?: () => void;
  showDismiss?: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const active = hover || rating;

  const handleSubmit = async () => {
    if (rating < 1) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        rating,
        comment: comment.trim() || undefined,
        context,
        reference,
      });
      markFeedbackDone();
      toast.success("Thanks for your feedback!");
      onResolved?.();
    } catch (e) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't send feedback. Please try again.",
      );
      setSubmitting(false);
    }
  };

  const dismiss = () => {
    markFeedbackDone();
    onResolved?.();
  };

  return (
    <div className="space-y-4">
      {/* Stars */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={submitting}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="rounded p-0.5 transition-transform hover:scale-110 disabled:cursor-default"
            >
              <Star
                className={`h-8 w-8 ${
                  n <= active
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
        <span className="h-4 text-xs font-medium text-slate-500">
          {LABELS[active]}
        </span>
      </div>

      {/* Optional comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        disabled={submitting}
        placeholder="Tell us more (optional)…"
        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:opacity-60"
      />

      <div className="flex items-center gap-3">
        {showDismiss && (
          <button
            type="button"
            onClick={dismiss}
            disabled={submitting}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-60"
          >
            No thanks
          </button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={rating < 1 || submitting}
          className="ml-auto bg-blue-900 text-white hover:bg-blue-800"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Send feedback"
          )}
        </Button>
      </div>
    </div>
  );
}
