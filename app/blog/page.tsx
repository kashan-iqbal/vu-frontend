import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { blogPosts, formatDate } from "../data/blog";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Blog — Exam Tips & Study Guides | ExamPrep AI",
  description:
    "Study smarter with the ExamPrep AI blog: exam preparation guides, MCQ strategies, and tips on using AI to improve your grades.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 py-20">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            The ExamPrep AI Blog
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Practical study guides, MCQ strategies, and tips to help you prepare
            smarter and score higher.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 bg-slate-50">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-teal-300 hover:shadow-lg"
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mb-2 text-lg font-bold text-blue-900 group-hover:text-blue-700">
                  {post.title}
                </h2>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
                  {post.description}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {post.readTime}
                  </span>
                  <span>{formatDate(post.date)}</span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-600">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
