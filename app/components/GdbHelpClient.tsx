"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Check,
  Copy,
  FileText,
  Loader2,
  Lock,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  getGdbStatus,
  postGdbHelp,
  type GdbDraft,
  type GdbHelpResponse,
} from "@/lib/api/gdb.api";

const MIN_LEN = 20;

export default function GdbHelpClient() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<GdbHelpResponse | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["gdb-status"],
    queryFn: getGdbStatus,
    retry: 0,
    staleTime: 30 * 1000,
  });

  const mutation = useMutation({
    mutationFn: () => postGdbHelp(question),
    onSuccess: (data) => {
      setResult(data);
      setErrMsg(null);
    },
    onError: (err: unknown) => {
      const r = (err as { response?: { status?: number; data?: GdbHelpResponse } })
        .response;
      if (r?.status === 402) {
        setResult({ locked: true, ...(r.data ?? {}) }); // out of credits
        setErrMsg(null);
      } else {
        setResult(null);
        setErrMsg(
          r?.data?.message ??
            "We couldn't draft this right now. Please try again.",
        );
      }
    },
  });

  // Prefer the freshest numbers from the last response, else the status query.
  const credits = result?.credits ?? status?.credits ?? null;
  const hasPass = result?.hasPass ?? status?.hasPass ?? false;
  const locked = (result?.locked ?? status?.locked ?? false) && !result?.draft;

  const tooShort = question.trim().length < MIN_LEN;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header + balance */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-teal-600">
              <Sparkles className="h-4 w-4" />
              GDB &amp; Assignment Help
            </div>
            <h1 className="text-2xl font-bold text-blue-900 sm:text-3xl">
              Draft a starting framework
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Paste your GDB or assignment prompt and get an original outline — a
              stance, supporting points, a counterpoint and a conclusion — to
              build on in your own words.
            </p>
          </div>
          <CreditBadge credits={credits} hasPass={hasPass} />
        </div>

        {/* Academic integrity banner */}
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            <b>This is a study aid, not a submission.</b> Use it to understand how
            to structure your answer, then rewrite it in your own words. Submitting
            it as-is is academic dishonesty — you must edit, verify and own your
            work.
          </p>
        </div>

        {locked ? (
          <LockedUpgrade message={result?.message} />
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <label
                htmlFor="gdb-input"
                className="mb-2 block text-sm font-semibold text-blue-900"
              >
                Your GDB / assignment prompt
              </label>
              <textarea
                id="gdb-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={6}
                placeholder="Paste the full question here…"
                className="w-full resize-y rounded-xl border border-slate-300 p-3 text-sm text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  {tooShort
                    ? `Add a bit more (min ${MIN_LEN} characters).`
                    : `${question.trim().length} characters`}
                </span>
                <button
                  onClick={() => mutation.mutate()}
                  disabled={tooShort || mutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-300"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Drafting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Draft my framework
                    </>
                  )}
                </button>
              </div>
            </div>

            {errMsg && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errMsg}
              </p>
            )}

            {result?.draft && (
              <DraftView draft={result.draft} fromCache={result.fromCache} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CreditBadge({
  credits,
  hasPass,
}: {
  credits: number | null;
  hasPass: boolean;
}) {
  if (hasPass) {
    return (
      <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-800">
        Semester pass · active
      </span>
    );
  }
  if (credits === null) return null;
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${
        credits > 0 ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-700"
      }`}
    >
      {credits} credit{credits === 1 ? "" : "s"} left
    </span>
  );
}

function DraftView({
  draft,
  fromCache,
}: {
  draft: GdbDraft;
  fromCache?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const plain = useMemo(() => {
    const points = draft.supportingPoints.map((p) => `- ${p}`).join("\n");
    return [
      `Stance: ${draft.stance}`,
      `\nSupporting points:\n${points}`,
      `\nCounterpoint: ${draft.counterpoint}`,
      `\nConclusion: ${draft.conclusion}`,
    ].join("\n");
  }, [draft]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — ignore
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
          <FileText className="h-3.5 w-3.5" /> Draft — edit before you submit
        </span>
        <div className="flex items-center gap-2">
          {fromCache && (
            <span className="text-xs text-slate-400">served from cache</span>
          )}
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      <Section label="Stance">{draft.stance}</Section>

      {draft.supportingPoints.length > 0 && (
        <div className="mt-4">
          <SectionLabel>Supporting points</SectionLabel>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {draft.supportingPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <Section label="Counterpoint">{draft.counterpoint}</Section>
      <Section label="Conclusion">{draft.conclusion}</Section>

      {draft.registerNote && (
        <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Tip: </span>
          {draft.registerNote}
        </p>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-wide text-teal-600">
      {children}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div className="mt-4">
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {children}
      </p>
    </div>
  );
}

function LockedUpgrade({ message }: { message?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
      <div className="pointer-events-none select-none space-y-3 blur-sm">
        <div className="h-4 w-1/3 rounded bg-slate-300" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-5/6 rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50 p-4 text-center">
        <Lock className="h-6 w-6 text-blue-900" />
        <p className="text-sm font-semibold text-blue-900">
          {message ?? "You're out of GDB credits."}
        </p>
        <p className="max-w-xs text-xs text-slate-600">
          Get a semester pass for unlimited GDB &amp; assignment drafting, or ask
          an admin to top up your credits.
        </p>
      </div>
    </div>
  );
}
