"use client";

import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import TermSelector from "@/components/TermChange";
import { getHandout } from "@/lib/api/handout.api";

type Term = "midterm" | "finalterm";

export default function HandoutClient({
  code,
  examType,
}: {
  code: string;
  examType: Term;
}) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["handout", code, examType],
    queryFn: () => getHandout(code, examType),
    staleTime: 60 * 60 * 1000, // summaries rarely change
    retry: 0,
  });

  const status = (error as { response?: { status?: number } } | null)?.response
    ?.status;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-blue-900">{code} Summary</h2>
          <TermSelector code={code} current={examType} />
        </div>

        {isPending ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
            Loading handout…
          </div>
        ) : isError ? (
          <p className="text-red-600">
            {status === 404
              ? "No handout found for this course and term yet."
              : status === 401
                ? "Please log in to view this handout."
                : "Couldn't load this handout. Please try again."}
          </p>
        ) : (
          <article className="prose prose-slate max-w-none prose-headings:text-blue-900 prose-a:text-teal-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.content}
            </ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
