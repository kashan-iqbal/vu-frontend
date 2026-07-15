import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HandoutClient from "@/components/HandoutClient";
import { JsonLd } from "@/components/JsonLd";
import { getCourseByCode } from "@/lib/courses";
import {
  EXAM_TYPES,
  getHandoutContent,
  isExamType,
  listHandoutKeys,
  type ExamTypeValue,
} from "@/lib/api/handout.server";
import { siteConfig, absoluteUrl } from "@/lib/seo/site";

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
  if (!isExamType(examType)) {
    return { title: "Handout not found", robots: { index: false, follow: false } };
  }

  const handout = await getHandoutContent(code, examType);
  if (!handout) {
    return { title: "Handout not found", robots: { index: false, follow: false } };
  }

  const label = termLabel(examType);
  const codeUpper = code.toUpperCase();
  const course = getCourseByCode(code);
  const name = course ? `${codeUpper} ${course.title}` : codeUpper;
  const title = `${name} — ${label} Handouts & MCQs`;
  const description = course
    ? `${label} exam preparation for ${codeUpper} (${course.title}) at Virtual University (VU): a concise handout summary, adaptive MCQ practice and AI topic review. Independent VU study tool — not affiliated with VU.`
    : `${label} handouts and MCQ practice for VU course ${codeUpper}. Independent Virtual University study tool.`;
  const canonical = `/handout/${code}/${examType}`;

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
  if (!isExamType(examType)) return notFound();

  // Server-fetched so the summary is in the initial HTML (crawlable). This
  // endpoint is public, so no access rules change — only where it's rendered.
  const handout = await getHandoutContent(code, examType);
  if (!handout) return notFound();

  const label = termLabel(examType);
  const codeUpper = code.toUpperCase();
  const course = getCourseByCode(code);
  const canonical = absoluteUrl(`/handout/${code}/${examType}`);
  const otherTerm = EXAM_TYPES.find((t) => t !== examType) as ExamTypeValue;

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
          {label} handout summary, adaptive MCQ practice and AI topic review for
          {course ? ` ${codeUpper} (${course.title})` : ` ${codeUpper}`} at
          Virtual University. An independent study tool — not affiliated with VU.
        </p>
      </div>

      <HandoutClient code={code} examType={examType} initialData={handout} />

      <div className="mx-auto max-w-3xl px-4 pb-12 text-sm text-slate-500">
        Also revising the {termLabel(otherTerm).toLowerCase()}?{" "}
        <a
          className="font-medium text-teal-600 hover:text-teal-700"
          href={`/handout/${code}/${otherTerm}`}
        >
          Read the {codeUpper} {termLabel(otherTerm).toLowerCase()} handout
        </a>
        .
      </div>
    </>
  );
}
