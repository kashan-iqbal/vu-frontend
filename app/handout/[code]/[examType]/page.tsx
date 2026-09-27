import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HandoutClient from "@/components/HandoutClient";
import { JsonLd } from "@/components/JsonLd";
import { getCourseByCode, getRelatedCourses } from "@/lib/courses";
import { tryListPastQuizKeys } from "@/lib/api/pastQuiz.server";
import {
  EXAM_TYPES,
  getHandoutContent,
  isExamType,
  listHandoutKeys,
  tryListHandoutKeys,
  type ExamTypeValue,
} from "@/lib/api/handout.server";
import { siteConfig, absoluteUrl } from "@/lib/seo/site";
import { canonicalCourseCode } from "@/lib/courseCode";

const termLabel = (t: ExamTypeValue) =>
  t === "midterm" ? "Midterm" : "Final Term";

/**
 * Pre-render a page for every handout that ACTUALLY EXISTS — driven by the API,
 * not by the static course catalogue. Courses without a handout never get a
 * page, which keeps thin/empty URLs out of Google's index. New handouts appear
 * automatically on the next revalidation.
 *
 * If the API is unreachable at build time this returns [] and pages are
 * generated on demand (ISR) instead of failing the build.
 */
/**
 * Only the codes emitted by `generateStaticParams` below are valid URLs. Anything
 * else returns a REAL 404 from the routing layer.
 *
 * WHY: `notFound()` inside this page renders with HTTP **200** on Vercel (verified
 * 2026-09-26 on an uncached MISS), so /handout/<anything>/<term> was a 200 + noindex
 * soft-404 — an unbounded URL space Google had to crawl and file. `dynamicParams =
 * false` is the only reliable way to get a true 404 here.
 *
 * TRADE-OFF: a newly-added handout is no longer picked up by the next ISR
 * revalidation — it needs a rebuild, because `generateStaticParams` runs only at
 * build time. Trigger a Vercel Deploy Hook after importing handouts.
 *
 * Safe ONLY because `listHandoutKeys()` now THROWS when the API is unreachable
 * (see lib/api/upstream.ts). If it still returned [] on failure, a build during an
 * API outage would 404 the entire catalogue.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const keys = await listHandoutKeys();
  return keys.map((k) => ({ code: k.code, examType: k.examType }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; examType: string }>;
}): Promise<Metadata> {
  const { code, examType } = await params;
  const codeUpper = canonicalCourseCode(code);

  // Every branch below sets its OWN canonical. Without this the early returns
  // inherited the root layout's `canonical: "/"`, so a broken handout page told
  // Google it was a duplicate of the homepage — which is why the pages poisoned in
  // 2026-08 got consolidated away rather than merely dropped.
  const canonical = `/handout/${codeUpper}/${examType}`;
  const notFoundMeta: Metadata = {
    title: "Handout not found",
    robots: { index: false, follow: false },
    alternates: { canonical },
  };

  if (!isExamType(examType)) return notFoundMeta;

  const handout = await getHandoutContent(codeUpper, examType);
  if (!handout) return notFoundMeta;

  const label = termLabel(examType);
  const course = getCourseByCode(codeUpper);
  const name = course ? `${codeUpper} ${course.title}` : codeUpper;
  const title = `${name} — ${label} Handouts & MCQs`;
  const description = course
    ? `${label} exam preparation for ${codeUpper} (${course.title}) at Virtual University (VU): a concise handout summary, adaptive MCQ practice and AI topic review. Independent VU study tool — not affiliated with VU.`
    : `${label} handouts and MCQ practice for VU course ${codeUpper}. Independent Virtual University study tool.`;

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

  // Server-fetched so the summary is in the initial HTML (crawlable). This
  // endpoint is public, so no access rules change — only where it's rendered.
  const handout = await getHandoutContent(codeUpper, examType);
  if (!handout) return notFound();

  const label = termLabel(examType);
  const course = getCourseByCode(codeUpper);
  const canonical = absoluteUrl(`/handout/${codeUpper}/${examType}`);
  const otherTerm = EXAM_TYPES.find((t) => t !== examType) as ExamTypeValue;
  const related = getRelatedCourses(codeUpper, 6);

  // Link to past papers only when they exist (that page now returns a hard 404 when
  // they don't). Deliberately the LENIENT lister: this decides a link, not
  // indexability, so an API hiccup must drop the link rather than fail the render.
  const pastKeys = await tryListPastQuizKeys();
  const hasPastPapers = pastKeys.some(
    (k) => k.code.toUpperCase() === codeUpper && k.examType === examType,
  );

  // Now that unknown codes return a HARD 404 (dynamicParams = false), every
  // outgoing /handout link must be checked against the real handout list. The
  // "related courses" block is built from the STATIC catalogue (289 courses), most
  // of which have no handout — unguarded it would emit up to 6 broken links per
  // page. Lenient lister: a missing list hides links, it never breaks the page.
  const handoutKeys = await tryListHandoutKeys();
  const existingHandouts = new Set(
    handoutKeys.map((k) => `${k.code.toUpperCase()}/${k.examType}`),
  );
  const hasHandout = (c: string, t: string) =>
    existingHandouts.size === 0 || existingHandouts.has(`${c.toUpperCase()}/${t}`);
  const hasOtherTerm = hasHandout(codeUpper, otherTerm);
  const relatedWithHandouts = related.filter((c) => hasHandout(c.code, examType));

  // Course- and term-specific intro so pages don't all share one templated line.
  const courseName = course ? `${codeUpper} (${course.title})` : codeUpper;
  const creditBit = course?.credits ? ` ${course.credits}-credit-hour` : "";
  const intro =
    examType === "midterm"
      ? `Everything you need to revise the first half of the${creditBit} ${courseName} syllabus for the Virtual University midterm — a concise handout summary, adaptive MCQ practice and AI topic review.`
      : `Prepare for the Virtual University final term of${creditBit} ${courseName}, which leans on the second half of the syllabus and is often partly cumulative — a concise handout summary, adaptive MCQ practice and AI topic review.`;

  const courseLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course ? `${codeUpper} — ${course.title}` : `${codeUpper} Handouts`,
    description: course
      ? `${label} handout summary, MCQ practice and AI topic review for ${codeUpper} (${course.title}) at Virtual University.`
      : `${label} handouts and MCQ practice for ${codeUpper} at Virtual University.`,
    courseCode: codeUpper,
    inLanguage: "en",
    url: canonical,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    ...(course?.credits ? { numberOfCredits: course.credits } : {}),
  };

  return (
    <>
      <JsonLd data={courseLd} />
      <div className="mx-auto max-w-3xl px-4 pt-10">
        <p className="text-sm font-medium text-teal-600">VU {label} Exam Prep</p>
        <h1 className="mt-1 text-2xl font-bold text-blue-900 sm:text-3xl">
          {course ? `${codeUpper} — ${course.title}` : `${codeUpper} Handouts`}
        </h1>
        <p className="mt-3 text-slate-600">
          {intro} An independent study tool — not affiliated with VU.
        </p>
        {hasPastPapers && (
          <p className="mt-3 text-sm text-slate-500">
            Want questions?{" "}
            <a
              className="font-medium text-teal-600 hover:text-teal-700"
              href={`/past-papers/${codeUpper}/${examType}`}
            >
              Practise {codeUpper} {label.toLowerCase()} past paper MCQs
            </a>{" "}
            with answers.
          </p>
        )}
      </div>

      <HandoutClient code={codeUpper} examType={examType} initialData={handout} />

      {hasOtherTerm && (
        <div className="mx-auto max-w-3xl px-4 pb-6 text-sm text-slate-500">
          Also revising the {termLabel(otherTerm).toLowerCase()}?{" "}
          <a
            className="font-medium text-teal-600 hover:text-teal-700"
            href={`/handout/${codeUpper}/${otherTerm}`}
          >
            Read the {codeUpper} {termLabel(otherTerm).toLowerCase()} handout
          </a>
          .
        </div>
      )}

      {relatedWithHandouts.length > 0 && (
        <nav
          aria-label="Related VU courses"
          className="mx-auto max-w-3xl px-4 pb-12"
        >
          <h2 className="text-sm font-semibold text-blue-900">
            Related VU courses
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {relatedWithHandouts.map((c) => (
              <li key={c.code}>
                <a
                  className="text-sm text-teal-600 hover:text-teal-700"
                  href={`/handout/${c.code.toUpperCase()}/${examType}`}
                >
                  {c.code.toUpperCase()} — {c.title} {label.toLowerCase()} handout
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
