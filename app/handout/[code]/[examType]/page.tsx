import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HandoutClient from "@/components/HandoutClient";
import { JsonLd } from "@/components/JsonLd";
import { allCourses, getCourseByCode } from "@/lib/courses";
import { siteConfig, absoluteUrl } from "@/lib/seo/site";

const VALID_TERMS = ["midterm", "finalterm"] as const;
type Term = (typeof VALID_TERMS)[number];

const termLabel = (t: Term) => (t === "midterm" ? "Midterm" : "Final Term");

// Statically pre-render a page for every course code × exam type at build time.
export function generateStaticParams() {
  return allCourses.flatMap((c) =>
    VALID_TERMS.map((examType) => ({ code: c.code, examType })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; examType: string }>;
}): Promise<Metadata> {
  const { code, examType } = await params;
  if (!VALID_TERMS.includes(examType as Term)) {
    return {
      title: "Handout not found",
      robots: { index: false, follow: false },
    };
  }
  const term = examType as Term;
  const label = termLabel(term);
  const codeUpper = code.toUpperCase();
  const course = getCourseByCode(code);
  const name = course ? `${codeUpper} ${course.title}` : codeUpper;
  const title = `${name} — ${label} Handouts & MCQs`;
  const description = course
    ? `${label} exam preparation for ${codeUpper} (${course.title}) at Virtual University (VU): concise handout summary, adaptive MCQ practice and AI topic review. Independent VU study tool — not affiliated with VU.`
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
  if (!VALID_TERMS.includes(examType as Term)) return notFound();

  const term = examType as Term;
  const label = termLabel(term);
  const codeUpper = code.toUpperCase();
  const course = getCourseByCode(code);
  const canonical = absoluteUrl(`/handout/${code}/${examType}`);

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
      {/* Server-rendered heading + intro so the page has indexable, crawlable
          content (the full summary below still loads for signed-in students). */}
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

      <HandoutClient code={code} examType={term} />
    </>
  );
}
