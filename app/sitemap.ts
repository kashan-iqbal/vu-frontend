import type { MetadataRoute } from "next";
import { siteConfig } from "./lib/seo/site";
import { blogPosts } from "./data/blog";
import { allCourses } from "./lib/courses";

const EXAM_TYPES = ["midterm", "finalterm"] as const;

/**
 * Dynamic XML sitemap covering only publicly indexable pages (marketing + blog).
 * Authenticated app routes are intentionally excluded (see robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
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

  // One entry per course code × exam type (midterm / finalterm).
  const handoutRoutes: MetadataRoute.Sitemap = allCourses.flatMap((c) =>
    EXAM_TYPES.map((examType) => ({
      url: `${base}/handout/${c.code}/${examType}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...staticRoutes, ...blogRoutes, ...handoutRoutes];
}
