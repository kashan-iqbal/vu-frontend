"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

export default function TermSelector({
  code,
  current,
}: {
  code: string;
  current: "midterm" | "finalterm";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const term = e.target.value;
    startTransition(() => {
      router.push(`/handout/${code}/${term}`);
    });
  };

  return (
    <div className="relative flex w-full items-center gap-2 sm:w-auto">
      {isPending && (
        <Loader2 className="w-4 h-4 shrink-0 animate-spin text-teal-500" />
      )}
      <div className="relative w-full sm:w-auto">
        <select
          value={current}
          onChange={handleChange}
          disabled={isPending}
          className="w-full appearance-none bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 disabled:opacity-60 cursor-pointer sm:w-auto"
        >
          <option value="midterm">Midterm Short</option>
          <option value="finalterm">Final Term Short</option>
        </select>
        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
