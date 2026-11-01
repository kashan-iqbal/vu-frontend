import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Clock } from "lucide-react";
import { blogPosts, getPostBySlug, formatDate } from "../../data/blog";
import Footer from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { siteConfig, absoluteUrl } from "../../lib/seo/site";

// Pre-render every post at build time.
export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post not found", robots: { index: false, follow: false } };
  }
  const canonical = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: absoluteUrl(canonical),
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  // Nearest posts by shared tags, newest first, falling back to the most recent
  // posts so a tagless article still links onward rather than dead-ending.
  const tags = new Set(post.tags);
  const scored = blogPosts
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, shared: p.tags.filter((t) => tags.has(t)).length }))
    .sort((a, b) => b.shared - a.shared || b.p.date.localeCompare(a.p.date));
  const relatedPosts = scored.slice(0, 4).map((s) => s.p);

  const canonical = absoluteUrl(`/blog/${post.slug}`);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    keywords: post.tags.join(", "),
    inLanguage: "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    // Article/BlogPosting rich results want an image; the site's default OG card
    // (1200×630) is a valid, always-present asset.
    image: absoluteUrl("/opengraph-image"),
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      // Real logo asset (SVG is a Google-supported logo format); was the removed
      // /favicon.ico. Kept in sync with the Organization logo in the root layout.
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon-badge.svg"), width: 512, height: 512 },
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={[articleLd, breadcrumbLd]} />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold leading-tight text-blue-900 sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
          <span>
            By <span className="font-medium text-slate-500">{siteConfig.name}</span>
          </span>
          <span>{formatDate(post.date)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readTime}
          </span>
        </div>

        <div className="prose prose-slate mt-8 max-w-none prose-headings:text-blue-900 prose-a:text-teal-600 prose-strong:text-blue-900">
          <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
        </div>

        {/* ── Internal links out of the blog ──
            Measured 2026-10-31: a blog post linked to NOTHING — not to the course
            pages, not even to another post. The blog was a crawl dead end holding
            the site's best editorial rankings while passing none of that authority
            on. These two blocks are the fix. */}

        <aside className="mt-14 rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <h2 className="text-lg font-bold text-blue-900">
            Preparing for a VU exam?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Browse handout summaries and solved past-paper MCQs for every course
            we cover — midterm and final term, with AI explanations for anything
            you get wrong.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Browse all VU courses
          </Link>
        </aside>

        {relatedPosts.length > 0 && (
          <nav aria-label="Related articles" className="mt-12">
            <h2 className="text-sm font-semibold text-blue-900">
              Related reading
            </h2>
            <ul className="mt-3 space-y-2">
              {relatedPosts.map((p) => (
                <li key={p.slug}>
                  <Link
                    className="text-sm text-teal-600 hover:text-teal-700"
                    href={`/blog/${p.slug}`}
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>

      <Footer />
    </div>
  );
}
