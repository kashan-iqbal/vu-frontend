import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getHandoutContent,
  listHandoutKeys,
} from "@/lib/api/handout.server";
import { canonicalCourseCode } from "@/lib/courseCode";

/**
 * /handout/<code> → the summary that actually exists, preferring midterm.
 *
 * ── 2026-10-31: THIS ROUTE WAS DE-INDEXING ITSELF AND 140 SIBLINGS ──
 *
 * Measured live: /handout/CS201 returned **HTTP 200** carrying
 * `<meta name="robots" content="noindex">` AND `<link rel="canonical" href="/">`,
 * with the redirect smuggled into the streamed body as
 * `NEXT_REDIRECT;replace;/handout/CS201/midterm;307`. Search Console's
 * "Excluded by 'noindex' tag" bucket held exactly 141 pages — the exact number of
 * course codes in the sitemap.
 *
 * WHY: this file awaited `getHandoutContent()` — a network call to the backend —
 * BEFORE calling `redirect()`. Next streams the <head> as soon as it can, built
 * from the static `metadata` export below. By the time the slow API call resolved,
 * the 200 status and headers were already on the wire, so Next could not issue a
 * 307 and degraded to a client-side redirect. Google read the <head> as the truth:
 * *200 OK, don't index me, and I am a duplicate of the homepage.*
 *
 * The `noindex` was always intended and is harmless. The canonical to `/` is not:
 * telling Google that 141 URLs duplicate the homepage is the same mechanism that
 * consolidated ~180 pages away in 2026-08 (SEO_CONTEXT.md §11). The September fix
 * added self-canonicals to every metadata branch of the two CONTENT templates and
 * skipped this one, on the assumption in the old comment here that a
 * redirect-only page cannot have a canonical problem. It can, when it is not
 * actually redirecting.
 *
 * THE FIX, two independent layers so neither has to be perfect:
 *
 *   1. `generateStaticParams` + `dynamicParams = false` move the decision to BUILD
 *      time. There is no request-time await left to lose the race against the
 *      stream, so the redirect is resolved before any response begins, and an
 *      unknown code returns a real 404 from the routing layer instead of a
 *      soft-404.
 *   2. `generateMetadata` emits a SELF-REFERENTIAL canonical. If this page ever
 *      renders as HTML again for any reason, the worst case is a harmless
 *      `200 + noindex + self-canonical` — never a claim to be the homepage.
 *
 * Same trade-off as the detail templates: a newly imported handout needs a rebuild,
 * because `generateStaticParams` runs only at build time. Trigger a Vercel Deploy
 * Hook after importing handouts.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const keys = await listHandoutKeys();
  // One entry per distinct code — this route is term-agnostic.
  return [...new Set(keys.map((k) => k.code))].map((code) => ({ code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const codeUpper = canonicalCourseCode(code);

  return {
    // Still noindex: this URL only ever forwards, so it should not compete with
    // the term pages that hold the actual content.
    robots: { index: false, follow: true },
    // But NEVER inherit the root layout's `canonical: "/"`. See the note above.
    alternates: { canonical: `/handout/${codeUpper}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const codeUpper = canonicalCourseCode(code);

  // Resolved at build time (see dynamicParams above), so `redirect()` is reached
  // before any response has started streaming.
  if (await getHandoutContent(codeUpper, "midterm")) {
    redirect(`/handout/${codeUpper}/midterm`);
  }
  if (await getHandoutContent(codeUpper, "finalterm")) {
    redirect(`/handout/${codeUpper}/finalterm`);
  }
  return notFound();
}
