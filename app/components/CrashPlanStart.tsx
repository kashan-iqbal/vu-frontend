"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlarmClock,
  ArrowRight,
  BookOpen,
  CheckCircle,
  GraduationCap,
  ListChecks,
  Loader2,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { generateCrashPlan, getCrashPlan } from "@/lib/api/crashPlan.api";

type Term = "midterm" | "finalterm";

const TERMS: Term[] = ["midterm", "finalterm"];
const termLabel = (t: Term) => (t === "finalterm" ? "Final Term" : "Midterm");

// The server clamps to this same range — keep both sides in step.
const MIN_HOURS = 1;
const MAX_HOURS = 168;
const HOUR_PRESETS = [6, 12, 24, 48, 72];

const WHAT_YOU_GET = [
  { icon: BookOpen, text: "Study blocks on your weakest, highest-value topics" },
  { icon: ListChecks, text: "Short drills to prove each topic actually stuck" },
  {
    icon: Moon,
    text: "Scheduled rest, so the plan survives contact with reality",
  },
  { icon: GraduationCap, text: "A final mock exam before you walk in" },
];

// Step one of the crash-plan journey (/crash-plan/<code>): choose the exam and
// how long is left. The plan itself lives at /crash-plan/<code>/<term>.
export default function CrashPlanStart({ code }: { code: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [term, setTerm] = useState<Term>("finalterm");
  const [hours, setHours] = useState(24);

  // Shares its key with CrashPlanClient, so this tells us whether the student
  // already has a plan for the selected term — and lets them open it rather
  // than silently overwriting it.
  const existing = useQuery({
    queryKey: ["crashPlan", code, term],
    queryFn: () => getCrashPlan(code, term),
    retry: 0,
  });
  const hasPlan = existing.data?.exists === true;

  const gen = useMutation({
    mutationFn: () => generateCrashPlan(code, term, hours),
    onSuccess: (plan) => {
      // Seed the destination page's cache so it renders the plan immediately.
      qc.setQueryData(["crashPlan", code, term], plan);
      router.push(`/crash-plan/${code}/${term}`);
    },
    onError: () => toast.error("Couldn't build your plan. Please try again."),
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-teal-600">
            <AlarmClock className="h-4 w-4" />
            Exam Crash Plan
          </div>
          <h1 className="text-2xl font-bold text-blue-900 sm:text-3xl">
            {code} — plan the time you have left
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tell us which exam you are sitting and how many hours are left.
            We&apos;ll turn them into an ordered, hour-by-hour plan.
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          {/* Step 1 — which exam */}
          <div>
            <p className="mb-3 font-semibold text-blue-900">
              Which exam are you preparing for?
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {TERMS.map((t) => (
                <label
                  key={t}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    term === t
                      ? "border-blue-900 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="crashTerm"
                    value={t}
                    checked={term === t}
                    onChange={() => setTerm(t)}
                    className="h-4 w-4 accent-blue-900"
                  />
                  <span className="font-medium text-slate-700">
                    {termLabel(t)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Step 2 — hours left */}
          <div>
            <p className="mb-3 font-semibold text-blue-900">
              How many hours until the exam?
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                <input
                  type="number"
                  min={MIN_HOURS}
                  max={MAX_HOURS}
                  value={hours}
                  onChange={(e) =>
                    setHours(
                      Math.max(
                        MIN_HOURS,
                        Math.min(MAX_HOURS, Number(e.target.value) || MIN_HOURS),
                      ),
                    )
                  }
                  className="w-16 bg-transparent text-center text-lg font-bold text-blue-900 outline-none"
                />
                <span className="text-sm text-slate-500">hours left</span>
              </label>

              {HOUR_PRESETS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    hours === h
                      ? "bg-blue-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Anything from {MIN_HOURS} hour up to {MAX_HOURS} (one week).
            </p>
          </div>

          {/* Already has a plan for this term → offer it instead of overwriting */}
          {hasPlan && (
            <div className="flex flex-col gap-2 rounded-xl border border-teal-200 bg-teal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-700">
                You already have a {termLabel(term)} plan for {code}. Building a
                new one replaces it.
              </p>
              <Link
                href={`/crash-plan/${code}/${term}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-teal-700 shadow-sm transition-colors hover:bg-teal-100"
              >
                Open it
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => gen.mutate()}
            disabled={gen.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
          >
            {gen.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Building your plan...
              </>
            ) : (
              <>
                <AlarmClock className="h-5 w-5" />
                {hasPlan
                  ? `Rebuild for ${hours}h`
                  : `Build my ${hours}h crash plan`}
              </>
            )}
          </button>
        </div>

        {/* What the plan contains */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <p className="mb-3 font-semibold text-blue-900">What you&apos;ll get</p>
          <div className="space-y-3">
            {WHAT_YOU_GET.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm text-slate-700 sm:text-base"
              >
                <Icon className="h-5 w-5 shrink-0 text-teal-500" />
                <span>{text}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 text-sm text-slate-700 sm:text-base">
              <CheckCircle className="h-5 w-5 shrink-0 text-teal-500" />
              <span>
                Study blocks link straight into the {code} handout section they
                cover
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
