"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, CheckCircle, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUploadedCodes } from "@/lib/api/contribution.api";
import { PAST_PAPER_CODES } from "@/data/pastPaperCodes";
import { getCourseByCode } from "@/lib/courses";
import ContributeUploadModal from "./ContributeUploadModal";

type CourseCard = { code: string; title: string };

// Resolve titles once — the code list is static.
const CARDS: CourseCard[] = PAST_PAPER_CODES.map((code) => ({
  code,
  title: getCourseByCode(code)?.title ?? code,
}));

export default function ContributeClient() {
  const queryClient = useQueryClient();

  // Deep-link support: /contribute?code=CS615 (e.g. from a quiz with no questions
  // yet) pre-filters to that course and opens its upload dialog when the code is
  // on the allowlist. Read once at mount — no effect, no hydration flip.
  const params = useSearchParams();
  const initialCode = (params.get("code") ?? "").toUpperCase();
  const initialCard =
    CARDS.find((c) => c.code.toUpperCase() === initialCode) ?? null;

  const [search, setSearch] = useState(() => initialCode);
  const [active, setActive] = useState<CourseCard | null>(() => initialCard);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["contribution-codes"],
    queryFn: getUploadedCodes,
    staleTime: 60 * 1000,
    retry: 0,
  });

  const taken = useMemo(
    () => new Set((data ?? []).map((c) => c.toUpperCase())),
    [data],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CARDS;
    return CARDS.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q),
    );
  }, [search]);

  const refreshCodes = () =>
    queryClient.invalidateQueries({ queryKey: ["contribution-codes"] });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900 sm:text-3xl">
            Contribute course PDFs
          </h1>
          <p className="mt-1 text-slate-600">
            These courses still need a handout. Upload the PDF for a course to
            help other students — each course accepts one PDF.
          </p>
        </div>

        {/* Loading */}
        {isPending && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-slate-600">Couldn&apos;t load the course list.</p>
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-blue-900 text-white hover:bg-blue-800"
            >
              {isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          </div>
        )}

        {/* Grid */}
        {!isPending && !isError && (
          <>
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by course code or title..."
                  className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <p className="text-sm text-slate-500">
                {filtered.length} course{filtered.length === 1 ? "" : "s"} ·{" "}
                {taken.size} uploaded
              </p>
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                No courses match your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((card) => {
                  const isTaken = taken.has(card.code.toUpperCase());
                  return (
                    <div
                      key={card.code}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                          {card.code}
                        </span>
                        <h2 className="mt-0.5 line-clamp-2 text-sm font-semibold text-blue-900">
                          {card.title}
                        </h2>
                      </div>

                      {isTaken ? (
                        <div className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
                          <CheckCircle className="h-4 w-4 shrink-0" />
                          Uploaded
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActive(card)}
                          className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 active:scale-95"
                        >
                          <Upload className="h-4 w-4 shrink-0" />
                          Upload PDF
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <ContributeUploadModal
        open={!!active}
        onClose={() => setActive(null)}
        onUploaded={refreshCodes}
        code={active?.code ?? ""}
        courseTitle={active?.title ?? ""}
      />
    </div>
  );
}
