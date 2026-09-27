import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getCourseByCode, getRelatedCourses } from "@/lib/courses";
import {
  getPastMcqs,
  isExamType,
  listPastQuizKeys,
  type ExamTypeValue,
} from "@/lib/api/pastQuiz.server";
import { siteConfig, absoluteUrl } from "@/lib/seo/site";
import { canonicalCourseCode } from "@/lib/courseCode";
import { tryListHandoutKeys } from "@/lib/api/handout.server";

// Cap rendered questions so very large courses don't ship an enormous document
// (hurts LCP); the rest live in the interactive practice. SEO value is well
// served by a large, real sample.
const MAX_RENDERED = 120;
const LETTERS = ["A", "B", "C", "D"];

const termLabel = (t: ExamTypeValue) =>
  t === "midterm" ? "Midterm" : "Final Term";

/**
 * See the twin comment in app/handout/[code]/[examType]/page.tsx. `notFound()`
 * renders with HTTP 200 here too, so only the codes below are valid URLs and
 * everything else gets a real 404 from the routing layer.
 *
 * TRADE-OFF: newly-imported past papers need a rebuild (Vercel Deploy Hook), since
 * `generateStaticParams` runs only at build time. Safe only because
 * `listPastQuizKeys()` now throws instead of returning [] when the API is down.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const keys = await listPastQuizKeys();
  return keys.map((k) => ({ code: k.code, examType: k.examType }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; examType: string }>;
}): Promise<Metadata> {
  const { code, examType } = await params;
  const codeUpper = canonicalCourseCode(code);

  // Self-referential canonical on EVERY branch, including the not-found ones — they
  // used to fall through to the root layout's `canonical: "/"` and claim to be the
  // homepage.
  const canonical = `/past-papers/${codeUpper}/${examType}`;
  const notFoundMeta: Metadata = {
    title: "Past papers not found",
    robots: { index: false, follow: false },
    alternates: { canonical },
  };

  if (!isExamType(examType)) return notFoundMeta;

  const mcqs = await getPastMcqs(codeUpper, examType);
  if (mcqs.length === 0) return notFoundMeta;

  const label = termLabel(examType);
  const course = getCourseByCode(codeUpper);
  const name = course ? `${codeUpper} ${course.title}` : codeUpper;
  const title = `${name} — ${label} Past Papers & Solved MCQs`;
  const description = course
    ? `${mcqs.length}+ solved ${label.toLowerCase()} past paper MCQs for ${codeUpper} (${course.title}) at Virtual University (VU), with correct answers. Free practice — independent VU study tool, not affiliated with VU.`
    : `Solved ${label.toLowerCase()} past paper MCQs for VU course ${codeUpper}, with correct answers. Independent Virtual University study tool.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      type: "article",
      url: absoluteUrl(canonical),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string; examType: string }>;
}) {
  const { code, examType } = await params;
  const codeUpper = canonicalCourseCode(code);
  if (!isExamType(examType)) return notFound();

  const mcqs = await getPastMcqs(codeUpper, examType);
  if (mcqs.length === 0) return notFound();

  const label = termLabel(examType);
  const course = getCourseByCode(codeUpper);
  const name = course ? `${codeUpper} — ${course.title}` : `${codeUpper} Past Papers`;
  const canonical = absoluteUrl(`/past-papers/${codeUpper}/${examType}`);
  const shown = mcqs.slice(0, MAX_RENDERED);
  const related = getRelatedCourses(codeUpper, 6);

  // This page used to link to the handout UNCONDITIONALLY, while the handout page
  // guarded its link back. For a course with MCQs but no handout that was a link
  // into notFound() — and now that unknown codes 404 for real, a broken link.
  // Lenient lister: a missing list hides the link, it never breaks the page.
  const handoutKeys = await tryListHandoutKeys();
  const hasHandout =
    handoutKeys.length === 0 ||
    handoutKeys.some(
      (k) => k.code.toUpperCase() === codeUpper && k.examType === examType,
    );

  // Only link related courses that actually have past papers for this term —
  // getRelatedCourses() comes from the static catalogue, not the MCQ list.
  const pastKeys = await listPastQuizKeys();
  const existingPast = new Set(
    pastKeys.map((k) => `${k.code.toUpperCase()}/${k.examType}`),
  );
  const relatedWithPapers = related.filter((c) =>
    existingPast.has(`${c.code.toUpperCase()}/${examType}`),
  );

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      ...(hasHandout
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: `${codeUpper} Handouts`,
              item: absoluteUrl(`/handout/${codeUpper}/${examType}`),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: hasHandout ? 3 : 2,
        name: `${codeUpper} ${label} Past Papers`,
        item: canonical,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <div className="mx-auto max-w-3xl px-4 pt-10">
        <p className="text-sm font-medium text-teal-600">VU {label} Past Papers</p>
        <h1 className="mt-1 text-2xl font-bold text-blue-900 sm:text-3xl">
          {name} — {label} Past Papers &amp; Solved MCQs
        </h1>
        <p className="mt-3 text-slate-600">
          {mcqs.length} solved {label.toLowerCase()} past paper MCQs for
          {course ? ` ${codeUpper} (${course.title})` : ` ${codeUpper}`} at Virtual
          University, each with the correct answer marked. Use them to learn the VU
          question style and test your recall. An independent study tool — not
          affiliated with VU.
        </p>
        {hasHandout && (
          <p className="mt-3 text-sm text-slate-500">
            Prefer a summary first?{" "}
            <a
              className="font-medium text-teal-600 hover:text-teal-700"
              href={`/handout/${codeUpper}/${examType}`}
            >
              Read the {codeUpper} {label.toLowerCase()} handout
            </a>
            .
          </p>
        )}
      </div>

      <ol className="mx-auto mt-8 max-w-3xl space-y-6 px-4 pb-6">
        {shown.map((m, i) => (
          <li key={m._id ?? `${m.id}-${i}`} className="rounded-lg border border-slate-200 p-5">
            <p className="font-medium text-slate-900">
              <span className="text-slate-400">Q{i + 1}.</span> {m.question}
            </p>
            <ul className="mt-3 space-y-1.5">
              {m.options.map((opt, oi) => {
                const correct = oi === m.correctAnswer;
                return (
                  <li
                    key={oi}
                    className={
                      correct
                        ? "rounded-md bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800"
                        : "px-3 py-1.5 text-sm text-slate-600"
                    }
                  >
                    <span className="mr-2 font-semibold text-slate-400">
                      {LETTERS[oi] ?? oi + 1}.
                    </span>
                    {opt}
                    {correct && <span className="ml-2 text-xs font-semibold text-teal-600">✓ Correct</span>}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      {mcqs.length > MAX_RENDERED && (
        <p className="mx-auto max-w-3xl px-4 pb-6 text-sm text-slate-500">
          Showing the first {MAX_RENDERED} of {mcqs.length} MCQs.
        </p>
      )}

      {relatedWithPapers.length > 0 && (
        <nav aria-label="Related VU courses" className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-sm font-semibold text-blue-900">Related VU courses</h2>
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {relatedWithPapers.map((c) => (
              <li key={c.code}>
                <a className="text-sm text-teal-600 hover:text-teal-700" href={`/past-papers/${c.code.toUpperCase()}/${examType}`}>
                  {c.code.toUpperCase()} — {c.title} {label.toLowerCase()} past papers
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
