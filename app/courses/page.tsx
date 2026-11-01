import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getCourseByCode } from "@/lib/courses";
import { listHandoutKeys } from "@/lib/api/handout.server";
import { tryListPastQuizKeys } from "@/lib/api/pastQuiz.server";
import { siteConfig, absoluteUrl } from "@/lib/seo/site";

/**
 * PUBLIC, INDEXABLE course directory — the crawl entry point the site never had.
 *
 * ── Why this page exists ──
 *
 * Measured 2026-10-31: NOT ONE indexable page on this site linked to any of the 282
 * handout or 154 past-paper pages. Homepage: 0. /features: 0. /blog: 0. Blog posts: 0.
 * /about: 0. All 436 money pages were orphaned.
 *
 * They do link to each other (6 related courses each, plus their own other term and
 * matching past-paper page) — but that is a closed loop with no door. Worse, each one
 * links OUT to /about, /features and /blog, so authority drained out of the content
 * surface and nothing flowed back in.
 *
 * Google needs two separate things, and a sitemap only provides the first:
 *   discovery  — "this URL exists"           → sitemap OR links
 *   authority  — "this URL is worth keeping" → LINKS ONLY
 * A sitemap confers no authority at all, which is why 161 pages sat in
 * "Crawled - currently not indexed": seen, then judged to have nothing recommending
 * them.
 *
 * /course (singular) could not be reused for this: it sits behind AuthGuard, its route
 * group sets robots noindex, and robots.txt disallows it — all correct, because it is
 * an app screen for logged-in students. This is its public counterpart.
 *
 * Built from the REAL API lists, never the 289-course static catalogue, so every link
 * points at a page that exists. Unknown codes now hard-404 (dynamicParams = false on
 * both detail templates), which makes a broken link here a real defect, not a cosmetic
 * one.
 */

export const revalidate = 86400;

const CANONICAL = "/courses";

export const metadata: Metadata = {
  title: "All VU Courses — Handouts, Past Papers & MCQ Practice",
  description:
    "Browse every Virtual University (VU) course with a handout summary or solved past-paper MCQs on ExamPrep AI. Midterm and final term prep for 140+ courses. Independent study tool — not affiliated with VU.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: `All VU Courses — Handouts, Past Papers & MCQ Practice | ${siteConfig.name}`,
    description:
      "Every VU course with handouts or solved past-paper MCQs, for midterm and final term.",
    type: "website",
    url: absoluteUrl(CANONICAL),
  },
};

/** Group by the letter prefix of the course code — how VU students actually think. */
function subjectOf(code: string): string {
  const m = /^[A-Z]+/.exec(code.toUpperCase());
  return m ? m[0] : "Other";
}

type Row = {
  code: string;
  title?: string;
  handout: { midterm: boolean; finalterm: boolean };
  past: { midterm: boolean; finalterm: boolean };
};

export default async function Page() {
  // Strict lister: if the API is unreachable the build fails loudly rather than
  // publishing an empty directory, which would be worse than none at all.
  const handoutKeys = await listHandoutKeys();
  // Lenient: past papers only decorate the rows, so an API hiccup drops the extra
  // links instead of breaking the page.
  const pastKeys = await tryListPastQuizKeys();

  const byCode = new Map<string, Row>();
  const ensure = (raw: string): Row => {
    const code = raw.toUpperCase();
    let row = byCode.get(code);
    if (!row) {
      row = {
        code,
        title: getCourseByCode(code)?.title,
        handout: { midterm: false, finalterm: false },
        past: { midterm: false, finalterm: false },
      };
      byCode.set(code, row);
    }
    return row;
  };

  for (const k of handoutKeys) {
    const row = ensure(k.code);
    if (k.examType === "midterm") row.handout.midterm = true;
    if (k.examType === "finalterm") row.handout.finalterm = true;
  }
  for (const k of pastKeys) {
    const row = ensure(k.code);
    if (k.examType === "midterm") row.past.midterm = true;
    if (k.examType === "finalterm") row.past.finalterm = true;
  }

  const groups = new Map<string, Row[]>();
  for (const row of [...byCode.values()].sort((a, b) =>
    a.code.localeCompare(b.code),
  )) {
    const key = subjectOf(row.code);
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const sortedGroups = [...groups.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const courseCount = byCode.size;

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All VU Courses — Handouts, Past Papers & MCQ Practice",
    description: `Directory of ${courseCount} Virtual University courses with handout summaries or solved past-paper MCQs.`,
    url: absoluteUrl(CANONICAL),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <>
      <JsonLd data={collectionLd} />

      <div className="mx-auto max-w-5xl px-4 pt-10">
        <p className="text-sm font-medium text-teal-600">VU Course Directory</p>
        <h1 className="mt-1 text-2xl font-bold text-blue-900 sm:text-3xl">
          All VU courses — handouts, past papers &amp; MCQ practice
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Every Virtual University course we currently cover, grouped by code. Each
          one links to its handout summary and, where we have them, solved
          past-paper MCQs for the midterm and final term. An independent study tool
          — not affiliated with VU.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {courseCount} courses · updated daily
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-8">
        {/* Jump links so a 140-row page stays navigable on a phone. */}
        <nav aria-label="Jump to subject" className="mt-6 flex flex-wrap gap-2">
          {sortedGroups.map(([subject]) => (
            <a
              key={subject}
              href={`#${subject}`}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-blue-900 hover:border-teal-300 hover:bg-teal-50"
            >
              {subject}
            </a>
          ))}
        </nav>

        {sortedGroups.map(([subject, rows]) => (
          <section key={subject} id={subject} className="mt-10 scroll-mt-20">
            <h2 className="text-lg font-bold text-blue-900">
              {subject}{" "}
              <span className="text-sm font-normal text-slate-500">
                ({rows.length})
              </span>
            </h2>

            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {rows.map((row) => (
                <li
                  key={row.code}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="font-semibold text-blue-900">
                    {row.code}
                    {row.title ? (
                      <span className="font-normal text-slate-600">
                        {" "}
                        — {row.title}
                      </span>
                    ) : null}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {row.handout.midterm && (
                      <Link
                        className="text-teal-600 hover:text-teal-700"
                        href={`/handout/${row.code}/midterm`}
                      >
                        Midterm handout
                      </Link>
                    )}
                    {row.handout.finalterm && (
                      <Link
                        className="text-teal-600 hover:text-teal-700"
                        href={`/handout/${row.code}/finalterm`}
                      >
                        Final term handout
                      </Link>
                    )}
                    {row.past.midterm && (
                      <Link
                        className="text-blue-900 hover:text-blue-700"
                        href={`/past-papers/${row.code}/midterm`}
                      >
                        Midterm past papers
                      </Link>
                    )}
                    {row.past.finalterm && (
                      <Link
                        className="text-blue-900 hover:text-blue-700"
                        href={`/past-papers/${row.code}/finalterm`}
                      >
                        Final term past papers
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Footer />
    </>
  );
}
