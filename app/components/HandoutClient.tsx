"use client";

import { useQuery } from "@tanstack/react-query";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import TermSelector from "@/components/TermChange";
import { NoCopy } from "@/components/NoCopy";
import { getHandout, type Handout } from "@/lib/api/handout.api";
import { slugify, headingText } from "@/lib/slug";

type Term = "midterm" | "finalterm";

// Give each heading a stable slug id so crash-plan study blocks can deep-link to a
// section (#anchor). scroll-mt keeps the target clear of any sticky chrome.
const heading = (Tag: "h2" | "h3" | "h4" | "h5") => {
  const H = ({ children, ...props }: ComponentPropsWithoutRef<typeof Tag>) => (
    <Tag id={slugify(headingText(children))} className="scroll-mt-24" {...props}>
      {children}
    </Tag>
  );
  H.displayName = `Handout${Tag}`;
  return H;
};

// Handout markdown routinely opens with its own `# Title`, and some documents use
// several. Rendered as real <h1>s those stacked on top of the page's own <h1>, so
// live pages carried 2-3 of them (measured 2026-10-31: 2 on CS201/finalterm, 3 on
// MGT504/midterm). A document should have exactly one <h1> — the page's — so every
// markdown level is demoted one step. Anchors are unaffected: the id still comes
// from slugify(), so crash-plan deep links keep working.
const markdownComponents = {
  h1: heading("h2"),
  h2: heading("h3"),
  h3: heading("h4"),
  h4: heading("h5"),
};

export default function HandoutClient({
  code,
  examType,
  initialData,
}: {
  code: string;
  examType: Term;
  /**
   * Handout fetched on the server. When provided, the summary renders straight
   * into the SSR HTML (so crawlers see the real content and there's no loading
   * flash); React Query still owns it from there.
   */
  initialData?: Handout;
}) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["handout", code, examType],
    queryFn: () => getHandout(code, examType),
    staleTime: 60 * 60 * 1000, // summaries rarely change
    retry: 0,
    initialData,
  });

  const status = (error as { response?: { status?: number } } | null)?.response
    ?.status;

  return (
    <NoCopy className="min-h-screen bg-white py-12">
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {data.content}
            </ReactMarkdown>
          </article>
        )}
      </div>
    </NoCopy>
  );
}
