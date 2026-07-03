import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Branded 404. Next.js serves this with the correct HTTP 404 status, which is
 * important so search engines don't index missing pages as soft-404s.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-white px-4 text-center">
      <p className="text-sm font-semibold text-teal-600">404</p>
      <h1 className="mt-2 text-3xl font-bold text-blue-900 sm:text-4xl">
        This page could not be found
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        The page you’re looking for may have moved or no longer exists. Let’s get
        you back on track.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button className="bg-teal-500 text-white hover:bg-teal-600">
            Back to home
          </Button>
        </Link>
        <Link href="/blog">
          <Button
            variant="outline"
            className="border-blue-900 text-blue-900 hover:bg-blue-50"
          >
            Read the blog
          </Button>
        </Link>
      </div>
    </main>
  );
}
