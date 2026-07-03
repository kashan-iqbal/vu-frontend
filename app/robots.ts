import type { MetadataRoute } from "next";
import { siteConfig } from "./lib/seo/site";

/**
 * Dynamic robots.txt.
 *
 * Public marketing + blog pages are crawlable. Authenticated, user-specific
 * app routes (course, quiz, handout, topic-review, ai-chat, past-mcqs,
 * short-video) and the auth pages are disallowed — they are gated behind
 * AuthGuard, carry no unique indexable content, and should not appear in search.
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
    host: siteConfig.url,
  };
}
