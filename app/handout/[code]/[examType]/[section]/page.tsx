import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ListTree } from "lucide-react";
import HandoutSectionBody from "@/components/HandoutSectionBody";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getCourseByCode } from "@/lib/courses";
import {
  getHandoutContent,
  isExamType,
  listHandoutKeys,
  type ExamTypeValue,
} from "@/lib/api/handout.server";
import { splitHandout, buildHandoutPages } from "@/lib/handoutSections";
import { siteConfig, absoluteUrl } from "@/lib/seo/site";
import { canonicalCourseCode } from "@/lib/courseCode";

/**
 * One page of a long handout.
 *
 * ── Why handouts are split ──
 *
 * The single-page handout template averaged 466 KB of HTML across 282 pages, with
 * 103 over 500 KB and the worst at 1.59 MB. Two of four pages tested could not load
 * in Lighthouse at all (`net::ERR_TIMED_OUT`) — on a CDN cache hit with sub-second
 * TTFB, so the bytes were the bottleneck, not the server. Google's mobile-first
 * crawler works under the same budget, which makes this a likely cause of the 161
 * pages stuck in "Crawled - currently not indexed".
 *
 * Grouping consecutive `##` sections to a ~50 KB markdown target yields pages of
 * roughly 100 KB of HTML (median 43 KB of markdown, about 6,500 words — substantial,
 * not thin) and adds ~1,400 URLs. Publishing one page per `##` instead would have
 * meant ~7,100 URLs averaging 8 KB, which on a domain recovering from an index
 * collapse is the thin-content-at-scale trap. See lib/handoutSections.ts.
 *
 * Handouts already below the target are never split and keep their single URL.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const keys = await listHandoutKeys();
  const params: Array<{ code: string; examType: string; section: string }> = [];

  for (const key of keys) {
    const handout = await getHandoutContent(key.code, key.examType);
    if (!handout?.content) continue;
    const pages = buildHandoutPages(splitHandout(handout.content));
    for (const page of pages) {
      params.push({
        code: key.code,
        examType: key.examType,
        section: page.slug,
      });
    }
  }

  return params;
}

const termLabel = (t: ExamTypeValue) =>
  t === "midterm" ? "Midterm" : "Final Term";

/** Shared loader so metadata and the page body agree on what exists. */
async function load(code: string, examType: string, section: string) {
  if (!isExamType(examType)) return null;
  const handout = await getHandoutContent(code, examType);
  if (!handout?.content) return null;

  const split = splitHandout(handout.content);
  const pages = buildHandoutPages(split);
  const index = pages.findIndex((p) => p.slug === section);
  if (index === -1) return null;

  return {
    split,
    pages,
    index,
    page: pages[index],
    prev: index > 0 ? pages[index - 1] : null,
    next: index < pages.length - 1 ? pages[index + 1] : null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; examType: string; section: string }>;
}): Promise<Metadata> {
  const { code, examType, section } = await params;
  const codeUpper = canonicalCourseCode(code);
  const canonical = `/handout/${codeUpper}/${examType}/${section}`;

  const loaded = await load(codeUpper, examType, section);
  if (!loaded) {
    // Every branch sets its OWN canonical — inheriting the root layout's `/` is
    // what told Google ~180 pages were duplicates of the homepage in 2026-08.
    return {
      title: "Handout section not found",
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  const label = termLabel(examType as ExamTypeValue);
  const course = getCourseByCode(codeUpper);
  const name = course ? `${codeUpper} ${course.title}` : codeUpper;
  const part = `Part ${loaded.index + 1} of ${loaded.pages.length}`;
  const title = `${loaded.page.title} — ${name} ${label} Handout`;
  const description = course
    ? `${loaded.page.title}: ${label.toLowerCase()} handout notes for ${codeUpper} (${course.title}) at Virtual University. ${part}, with MCQ practice and AI topic review. Independent VU study tool — not affiliated with VU.`
    : `${loaded.page.title}: ${label.toLowerCase()} handout notes for VU course ${codeUpper}. ${part}.`;

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
  params: Promise<{ code: string; examType: string; section: string }>;
}) {
  const { code, examType, section } = await params;
  const codeUpper = canonicalCourseCode(code);

  const loaded = await load(codeUpper, examType, section);
  if (!loaded) return notFound();

  const { page, prev, next, pages, index } = loaded;
  const label = termLabel(examType as ExamTypeValue);
  const course = getCourseByCode(codeUpper);
  const indexUrl = `/handout/${codeUpper}/${examType}`;
  const canonical = absoluteUrl(`${indexUrl}/${section}`);

  // Breadcrumbs matter more here than on a flat page: they tell Google this URL is
  // part of a course's handout rather than a standalone fragment.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "All VU courses",
        item: absoluteUrl("/courses"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${codeUpper} ${label} handout`,
        item: absoluteUrl(indexUrl),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: page.title,
        item: canonical,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />

      <div className="mx-auto max-w-3xl px-4 pt-10">
        <Link
          href={indexUrl}
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {codeUpper} {label.toLowerCase()} handout contents
        </Link>

        <p className="mt-6 text-sm font-medium text-teal-600">
          Part {index + 1} of {pages.length} · VU {label} Exam Prep
        </p>
        <h1 className="mt-1 text-2xl font-bold text-blue-900 sm:text-3xl">
          {page.title}
        </h1>
        <p className="mt-3 text-slate-600">
          {course ? `${codeUpper} — ${course.title}` : codeUpper}. An independent
          study tool — not affiliated with VU.
        </p>

        {page.sectionTitles.length > 1 && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <ListTree className="h-3.5 w-3.5" /> On this page
            </p>
            <ul className="mt-2 space-y-1">
              {page.sectionTitles.map((t) => (
                <li key={t} className="text-sm text-slate-700">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="py-8">
        <HandoutSectionBody markdown={page.markdown} />
      </div>

      {/* Sequential nav: keeps a reader moving through the handout and gives the
          crawler a chain through every part without relying on the index page. */}
      <nav
        aria-label="Handout parts"
        className="mx-auto flex max-w-3xl flex-col gap-3 px-4 pb-12 sm:flex-row sm:justify-between"
      >
        {prev ? (
          <Link
            href={`${indexUrl}/${prev.slug}`}
            className="flex-1 rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:bg-teal-50"
          >
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </span>
            <span className="mt-1 block text-sm font-medium text-blue-900">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}

        {next ? (
          <Link
            href={`${indexUrl}/${next.slug}`}
            className="flex-1 rounded-xl border border-slate-200 p-4 text-right hover:border-teal-300 hover:bg-teal-50"
          >
            <span className="flex items-center justify-end gap-1 text-xs font-semibold text-slate-500">
              Next <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block text-sm font-medium text-blue-900">
              {next.title}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>

      <Footer />
    </>
  );
}
