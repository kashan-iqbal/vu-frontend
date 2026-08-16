"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AlarmClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateCrashPlan } from "@/lib/api/crashPlan.api";

type Term = "midterm" | "finalterm";

// Panic-buy entry on the quiz start page: pick your exam + hours left and get a
// time-boxed crash plan. Generates then jumps straight to the plan page.
export default function CrashPlanEntry({ code }: { code: string }) {
  const router = useRouter();
  const [term, setTerm] = useState<Term>("finalterm");
  const [hours, setHours] = useState(24);

  const gen = useMutation({
    mutationFn: () => generateCrashPlan(code, term, hours),
    onSuccess: () => router.push(`/crash-plan/${code}/${term}`),
    onError: () => toast.error("Couldn't build your plan. Please try again."),
  });

  return (
    <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 text-left">
      <div className="mb-1 flex items-center gap-2 font-semibold text-teal-700">
        <AlarmClock className="h-5 w-5" />
        Exam soon? Get a crash plan
      </div>
      <p className="mb-4 text-sm text-slate-600">
        Turn the hours you have left into an ordered study plan — weakest,
        highest-value topics first, with drills, rest and a final mock.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
          {(["midterm", "finalterm"] as Term[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTerm(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
                term === t
                  ? "bg-blue-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t === "finalterm" ? "Final term" : "Midterm"}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5">
          <input
            type="number"
            min={1}
            max={168}
            value={hours}
            onChange={(e) =>
              setHours(Math.max(1, Math.min(168, Number(e.target.value) || 1)))
            }
            className="w-14 bg-transparent text-center text-base font-bold text-blue-900 outline-none"
          />
          <span className="text-sm text-slate-500">hrs left</span>
        </label>

        <button
          onClick={() => gen.mutate()}
          disabled={gen.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
        >
          {gen.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <AlarmClock className="h-4 w-4" />
          )}
          Build my crash plan
        </button>
      </div>
    </div>
  );
}
