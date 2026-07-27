"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  PartyPopper,
  RefreshCw,
  Volume2,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTopicReview } from "@/lib/api/topic-review.api";
import { InlineFeedback } from "@/components/feedback/InlineFeedback";

// Strip basic markdown so the speech reads cleanly (no asterisks/backticks/etc).
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Text-to-speech button (browser Web Speech API — client-side, no backend).
function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  // Stop any in-progress speech if the user navigates away.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const toggle = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    // Cancel anything else currently playing, then read this explanation.
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  };

  return (
    <button
      onClick={toggle}
      aria-label={speaking ? "Stop reading" : "Listen to explanation"}
      title={speaking ? "Stop" : "Listen"}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
        speaking
          ? "bg-teal-500 text-white hover:bg-teal-600"
          : "bg-teal-50 text-teal-600 hover:bg-teal-100"
      }`}
    >
      {speaking ? (
        <Square className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  );
}

export default function TopicReviewClient({ quizCode }: { quizCode: string }) {
  const router = useRouter();

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["topic-review", quizCode],
    queryFn: () => getTopicReview(quizCode),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  // ── Loading ──
  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm font-medium text-slate-600">
            Generating AI explanations…
          </p>
          <p className="text-xs text-slate-400">This can take a few seconds.</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <p className="text-sm font-medium text-red-600">
            We couldn&apos;t load your topic explanations.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              className="h-10 bg-slate-200 px-5 font-semibold text-slate-900 hover:bg-slate-300"
            >
              Go back
            </Button>
            <Button
              onClick={() => refetch()}
              className="h-10 gap-2 bg-blue-900 px-5 font-semibold text-white hover:bg-blue-800"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const topics = data.topics ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-lg font-bold text-blue-900 sm:text-xl">
              <Sparkles className="h-5 w-5 text-teal-500" /> Topics to Review
            </h1>
            <p className="text-xs text-slate-500">
              AI explanations · {data.code} · {data.type}
            </p>
          </div>
        </div>

        {topics.length === 0 ? (
          // ── Empty / nothing to review ──
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
            <PartyPopper className="h-10 w-10 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">
                Nothing to review here!
              </p>
              <p className="mt-1 text-sm text-green-700">
                You have no recorded weak topics for this quiz. Great work.
              </p>
            </div>
            <Button
              onClick={() => router.back()}
              className="h-10 bg-blue-900 px-6 font-semibold text-white hover:bg-blue-800"
            >
              Back to results
            </Button>
          </div>
        ) : (
          // ── Topic cards ──
          <div className="space-y-4">
            {topics.map((item) => (
              <div
                key={item.topic}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-base font-bold text-blue-900 sm:text-lg">
                    <Sparkles className="h-4 w-4 shrink-0 text-teal-500" />
                    {item.topic}
                  </h2>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.missedCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        {item.missedCount} missed
                      </span>
                    )}
                    <SpeakButton text={item.explanation} />
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 prose-p:my-1.5 prose-strong:text-blue-900">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {item.explanation}
                  </Markdown>
                </div>
              </div>
            ))}

            {isFetching && (
              <p className="text-center text-xs text-slate-400">Refreshing…</p>
            )}

            <InlineFeedback
              context="topic-review"
              reference={quizCode}
              title="Were these explanations helpful?"
              subtitle="Rate the AI review to help us improve it."
            />
          </div>
        )}
      </main>
    </div>
  );
}
