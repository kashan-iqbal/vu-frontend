import type { MetadataRoute } from "next";
import { siteConfig } from "./lib/seo/site";
import { blogPosts } from "./data/blog";
import { listHandoutKeys } from "./lib/api/handout.server";
import { listPastQuizKeys } from "./lib/api/pastQuiz.server";

/**
 * Dynamic XML sitemap covering only publicly indexable pages (marketing, blog,
 * handouts and past papers). Authenticated app routes are excluded (see robots.ts).
 *
 * Handout and past-paper URLs come from the API's real lists, so we only ever submit
 * pages that have content — submitting empty/404 URLs wastes crawl budget and gets
 * them dropped as thin pages.
 *
 * `lastModified` POLICY — read this before adding one back:
 * Every URL except the blog posts used to carry `lastModified: new Date()`, i.e. the
 * moment the sitemap happened to be regenerated. 443 of 462 URLs therefore claimed to
 * have changed *today, every day*. Google only honours <lastmod> when it reflects a
 * real content-change date and discounts it otherwise — so the site had no way to
 * signal "these pages were fixed, please recrawl", which is exactly what was needed
 * after the 2026-08 noindex incident.
 *
 * Omitting <lastmod> is strictly better than fabricating one. Only the blog carries
 * it, because `post.date` is a real date. To give handouts a real one, the backend
 * list endpoints must expose a per-item `updatedAt` — map it here then, not before.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  // The newest post date is a REAL modification date for the blog index.
  const newestPost = blogPosts
    .map((post) => post.date)
    .filter(Boolean)
    .sort()
    .at(-1);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/features`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${base}/blog`,
      ...(newestPost ? { lastModified: new Date(newestPost) } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    ...(post.date ? { lastModified: new Date(post.date) } : {}),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Only handouts that actually exist in the API (empty ones 404 and must never be
  // submitted). listHandoutKeys() THROWS if the API is unreachable rather than
  // returning [] — see the guard below for why that matters.
  const handoutKeys = await listHandoutKeys();
  const handoutRoutes: MetadataRoute.Sitemap = handoutKeys.map((k) => ({
    url: `${base}/handout/${k.code}/${k.examType}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Only pairs that actually have past-paper MCQs (count-gated server-side), so we
  // never submit an empty past-papers page.
  const pastPaperKeys = await listPastQuizKeys();
  const pastPaperRoutes: MetadataRoute.Sitemap = pastPaperKeys.map((k) => ({
    url: `${base}/past-papers/${k.code}/${k.examType}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // A sitemap that suddenly lists 26 URLs instead of ~460 is worse than no
  // regeneration at all: it un-submits the entire content surface. The listers throw
  // on an unreachable API, but a *successful* empty response would slip through — so
  // fail loudly here too. During ISR, Next keeps serving the last good sitemap.
  if (handoutRoutes.length === 0 && pastPaperRoutes.length === 0) {
    throw new Error(
      "Sitemap: the API returned no handouts AND no past papers. Refusing to " +
        "publish a truncated sitemap — keeping the previous one instead.",
    );
  }

  return [...staticRoutes, ...blogRoutes, ...handoutRoutes, ...pastPaperRoutes];
}
