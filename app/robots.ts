import type { MetadataRoute } from "next";
import { siteConfig } from "./lib/seo/site";

/**
 * Dynamic robots.txt.
 *
 * Public marketing + blog pages are crawlable. Authenticated, user-specific
 * app routes (course, quiz, handout, topic-review, past-mcqs) and the auth pages
 * are disallowed — they are gated behind AuthGuard, carry no unique indexable
 * content, and should not appear in search.
 *
 * `/ai-chat/` and `/Short-video/` stay listed although both routes are now
 * unrouted (their folders are `_`-prefixed, so Next does not serve them). Google
 * has already discovered those URLs; keeping the disallow stops it re-crawling
 * them only to find 404s. Drop these two lines once Search Console shows them
 * gone, or when either feature actually ships.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/course",
          "/quiz/",
          "/topic-review/",
          "/ai-chat/",
          "/past-mcqs/",
          "/Short-video/",
          "/login",
          "/signup",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
