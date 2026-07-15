import type { MetadataRoute } from "next";
import { siteConfig } from "./lib/seo/site";
import { blogPosts } from "./data/blog";
import { listHandoutKeys } from "./lib/api/handout.server";

/**
 * Dynamic XML sitemap covering only publicly indexable pages (marketing, blog
 * and handouts). Authenticated app routes are excluded (see robots.ts).
 *
 * Handout URLs come from the API's real handout list, so we only ever submit
 * pages that have content — submitting empty/404 URLs wastes crawl budget and
 * gets them dropped as thin pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Only handouts that actually exist in the API (empty ones 404 and must never
  // be submitted). Falls back to no handout entries if the API is unreachable.
  const handoutKeys = await listHandoutKeys();
  const handoutRoutes: MetadataRoute.Sitemap = handoutKeys.map((k) => ({
    url: `${base}/handout/${k.code}/${k.examType}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes, ...handoutRoutes];
}
