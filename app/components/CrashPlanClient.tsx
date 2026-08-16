"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlarmClock,
  BookOpen,
  CheckCircle,
  GraduationCap,
  ListChecks,
  Loader2,
  Lock,
  Moon,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCrashPlan,
  generateCrashPlan,
  type CrashActivity,
  type CrashBlock,
  type CrashQuestion,
} from "@/lib/api/crashPlan.api";
import { playCorrect, playWrong } from "@/lib/sound";

const examLabel = (t: string) => (t === "finalterm" ? "Final Term" : "Midterm");

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const durationMin = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);

const ACTIVITY: Record<
  CrashActivity,
  { label: string; icon: typeof BookOpen; ring: string; chip: string }
> = {
  study: {
    label: "Study",
    icon: BookOpen,
    ring: "border-blue-200 bg-blue-50",
    chip: "bg-blue-100 text-blue-800",
  },
  quiz: {
    label: "Drill",
    icon: ListChecks,
    ring: "border-teal-200 bg-teal-50",
    chip: "bg-teal-100 text-teal-800",
  },
  rest: {
    label: "Rest",
    icon: Moon,
    ring: "border-indigo-200 bg-indigo-50",
    chip: "bg-indigo-100 text-indigo-800",
  },
  mock: {
    label: "Mock exam",
    icon: GraduationCap,
    ring: "border-amber-200 bg-amber-50",
    chip: "bg-amber-100 text-amber-800",
  },
};

export default function CrashPlanClient({
  code,
  examType,
}: {
  code: string;
  examType: string;
}) {
  const qc = useQueryClient();
  const { data, isPending, isError } = useQuery({
    queryKey: ["crashPlan", code, examType],
    queryFn: () => getCrashPlan(code, examType),
    retry: 0,
  });

  const [hours, setHours] = useState(24);
  const [runningKey, setRunningKey] = useState<string | null>(null);

  const gen = useMutation({
    mutationFn: (h: number) => generateCrashPlan(code, examType, h),
    onSuccess: (res) => {
      qc.setQueryData(["crashPlan", code, examType], res);
      toast.success("Your crash plan is ready.");
    },
    onError: () => toast.error("Couldn't build your plan. Please try again."),
  });

  const runningBlock =
    runningKey && data?.blocks.find((b) => b.startTime === runningKey);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-teal-600">
            <AlarmClock className="h-4 w-4" />
            Exam Crash Plan
          </div>
          <h1 className="text-2xl font-bold text-blue-900 sm:text-3xl">
            {code} · {examLabel(examType)}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            A time-boxed plan that front-loads your weakest, highest-value
            topics — study, drill, rest and a final mock.
          </p>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-900" />
          </div>
        ) : isError ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
            Please log in to build your crash plan, then reload this page.
          </p>
        ) : !data.exists ? (
          <EmptyState
            hours={hours}
            setHours={setHours}
            onGenerate={() => gen.mutate(hours)}
            pending={gen.isPending}
          />
        ) : data.locked ? (
          <LockedTeaser blocks={data.blocks} />
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Built for <b>{data.hoursAvailable}h</b> until your exam ·{" "}
                {data.blockCount} blocks
              </p>
              <RegenerateControl
                hours={hours}
                setHours={setHours}
                onGenerate={() => gen.mutate(hours)}
                pending={gen.isPending}
              />
            </div>

            <ol className="space-y-3">
              {data.blocks.map((b, i) => (
                <TimelineBlock
                  key={b.startTime + i}
                  block={b}
                  onStartDrill={() => setRunningKey(b.startTime)}
                />
              ))}
            </ol>
          </>
        )}
      </div>

      {runningBlock && runningBlock.questions && (
        <CrashQuizRunner
          questions={runningBlock.questions}
          topic={runningBlock.topic ?? "Practice"}
          onClose={() => setRunningKey(null)}
        />
      )}
    </div>
  );
}

// ── Empty / first-run state ───────────────────────────────────────────────────
function EmptyState({
  hours,
  setHours,
  onGenerate,
  pending,
}: {
  hours: number;
  setHours: (n: number) => void;
  onGenerate: () => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <AlarmClock className="mx-auto mb-3 h-10 w-10 text-teal-500" />
      <h2 className="text-lg font-bold text-blue-900">
        How many hours until your exam?
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
        We&apos;ll turn the time you have left into an hour-by-hour plan focused
        on the topics most likely to cost you marks.
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        <HoursInput hours={hours} setHours={setHours} />
        <button
          onClick={onGenerate}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <AlarmClock className="h-4 w-4" />
          )}
          Build my plan
        </button>
      </div>
    </div>
  );
}

function HoursInput({
  hours,
  setHours,
}: {
  hours: number;
  setHours: (n: number) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
      <input
        type="number"
        min={1}
        max={168}
        value={hours}
        onChange={(e) =>
          setHours(Math.max(1, Math.min(168, Number(e.target.value) || 1)))
        }
        className="w-16 bg-transparent text-center text-lg font-bold text-blue-900 outline-none"
      />
      <span className="text-sm text-slate-500">hours</span>
    </label>
  );
}

function RegenerateControl(props: {
  hours: number;
  setHours: (n: number) => void;
  onGenerate: () => void;
  pending: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <HoursInput hours={props.hours} setHours={props.setHours} />
      <button
        onClick={props.onGenerate}
        disabled={props.pending}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-900 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-60"
      >
        {props.pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Rebuild
      </button>
    </div>
  );
}

// ── One timeline block ────────────────────────────────────────────────────────
function TimelineBlock({
  block,
  onStartDrill,
}: {
  block: CrashBlock;
  onStartDrill: () => void;
}) {
  const meta = ACTIVITY[block.activityType];
  const Icon = meta.icon;
  const mins = durationMin(block.startTime, block.endTime);

  return (
    <li className={`rounded-2xl border p-4 ${meta.ring}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className="h-5 w-5 text-blue-900" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.chip}`}
            >
              {meta.label}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {fmtTime(block.startTime)} – {fmtTime(block.endTime)} · {mins} min
            </span>
          </div>

          {block.topic && (
            <p className="mt-1 font-semibold text-blue-900">{block.topic}</p>
          )}
          {block.whyThisMatters && (
            <p className="mt-1 text-sm text-slate-600">
              {block.whyThisMatters}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {block.activityType === "study" && block.handoutRef && (
              <a
                href={
                  block.handoutRef.url +
                  (block.handoutRef.anchor ? `#${block.handoutRef.anchor}` : "")
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <BookOpen className="h-4 w-4" /> Open handout
              </a>
            )}
            {block.activityType === "quiz" &&
              (block.questions && block.questions.length > 0 ? (
                <button
                  onClick={onStartDrill}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-600"
                >
                  <ListChecks className="h-4 w-4" /> Start drill (
                  {block.questions.length})
                </button>
              ) : (
                <span className="text-xs text-slate-500">
                  No drill questions for this topic yet.
                </span>
              ))}
          </div>
        </div>
      </div>
    </li>
  );
}

// ── Locked (future paywall) teaser ────────────────────────────────────────────
function LockedTeaser({ blocks }: { blocks: CrashBlock[] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
      <ol className="space-y-2 blur-sm select-none pointer-events-none">
        {blocks.map((b, i) => (
          <li
            key={b.startTime + i}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <span className="font-semibold text-blue-900">
              {b.topic ?? ACTIVITY[b.activityType].label}
            </span>
            <span className="text-xs text-slate-500">
              {ACTIVITY[b.activityType].label}
            </span>
          </li>
        ))}
      </ol>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/40 text-center">
        <Lock className="h-6 w-6 text-blue-900" />
        <p className="max-w-xs text-sm font-semibold text-blue-900">
          Unlock your full crash plan — the study links, drills and timing.
        </p>
      </div>
    </div>
  );
}

// ── Inline drill runner ───────────────────────────────────────────────────────
function CrashQuizRunner({
  questions,
  topic,
  onClose,
}: {
  questions: CrashQuestion[];
  topic: string;
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  const q = questions[i];
  const chosen = selected[i];
  const answered = chosen !== undefined;
  const isLast = i === questions.length - 1;
  const correctCount = Object.entries(selected).filter(
    ([idx, a]) => questions[Number(idx)].correctAnswer === a,
  ).length;

  const pick = (opt: number) => {
    if (answered) return;
    setSelected((p) => ({ ...p, [i]: opt }));
    if (opt === q.correctAnswer) playCorrect();
    else playWrong();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-blue-900">{topic} drill</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close drill"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto mb-2 h-10 w-10 text-teal-500" />
            <p className="text-lg font-bold text-blue-900">
              {correctCount}/{questions.length} correct
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Nice — that&apos;s this topic drilled. Back to your plan.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Question {i + 1} of {questions.length}
            </p>
            <h4 className="mb-4 text-base font-bold text-blue-900">
              {q.question}
            </h4>

            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const isCorrect = idx === q.correctAnswer;
                const isChosen = chosen === idx;
                let cls =
                  "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50";
                if (answered) {
                  if (isCorrect) cls = "border-green-500 bg-green-50";
                  else if (isChosen) cls = "border-red-500 bg-red-50";
                  else cls = "border-slate-200 bg-white opacity-60";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => pick(idx)}
                    disabled={answered}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm font-medium text-slate-800 transition-all ${cls} ${
                      answered ? "cursor-default" : "cursor-pointer"
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answered && isCorrect && (
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                    )}
                    {answered && isChosen && !isCorrect && (
                      <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => (isLast ? setDone(true) : setI(i + 1))}
              disabled={!answered}
              className="mt-4 w-full rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-300"
            >
              {isLast ? "Finish drill" : "Next"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
