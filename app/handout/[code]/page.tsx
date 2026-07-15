import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getHandoutContent } from "@/lib/api/handout.server";

// This URL only ever redirects, so it should never be indexed in its own right.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/**
 * /handout/<code> → the summary that actually exists, preferring midterm.
 *
 * Previously this always redirected to /midterm, which produced a redirect into
 * a 404 for courses that only have a finalterm handout — wasted crawl budget and
 * a soft-404 signal. Now we only redirect to a term that exists.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  if (await getHandoutContent(code, "midterm")) {
    redirect(`/handout/${code}/midterm`);
  }
  if (await getHandoutContent(code, "finalterm")) {
    redirect(`/handout/${code}/finalterm`);
  }
  return notFound();
}
