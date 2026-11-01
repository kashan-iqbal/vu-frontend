import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  BookOpen,
  BarChart3,
  MessageSquare,
  Zap,
  Award,
} from "lucide-react";
import Link from "next/link";
import Footer from "./components/Footer";
import Testimonials from "./components/Testimonials";

/**
 * Landing Page - Modern Academic Minimalism Design
 * Hero section with generated background image
 * Features overview and call-to-action
 */
export default function Landing() {
  // NOTE: the "AI-Powered Chat" card was removed — the /ai-chat route it pointed
  // at was never wired to a backend, so the landing page was advertising a
  // feature that did not exist. Re-add it only when the chat actually ships.
  const features = [
    {
      icon: BarChart3,
      title: "Smart MCQ Generator",
      description:
        "Generate unlimited practice questions tailored to your course and difficulty level",
    },
    {
      icon: Award,
      title: "Performance Analytics",
      description:
        "Track your progress with detailed insights and personalized improvement recommendations",
    },
    {
      icon: Zap,
      title: "Quick Learning",
      description:
        "Learn efficiently with bite-sized content and focused study sessions",
    },
    {
      icon: MessageSquare,
      title: "Interactive Learning",
      description:
        "Engage with content through interactive quizzes and real-time feedback",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Courses",
      description:
        "Access structured courses covering all major Computer Science topics",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://d2xsxph8kpxj0f.cloudfront.net/89259946/jBE2t9QLC672dL5die5n5i/hero-landing-bhZgAZBDUjY4YpBKY5nxb9.webp"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 relative z-10 py-12 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900 mb-6 leading-tight">
              Master Your Exams with AI
            </h1>
            <p className="text-lg sm:text-xl text-slate-700 mb-8 leading-relaxed">
              ExamPrep AI combines intelligent tutoring,{" "}
              <Link
                href="/features"
                className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
              >
                personalized MCQ practice
              </Link>
              , and AI topic explanations to help you ace your university exams.
              Prepare smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/course" className="w-full sm:w-auto">
                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-lg">
                  Explore Courses
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-row justify-between sm:justify-start gap-4 sm:gap-10">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                  10K+
                </div>
                <div className="text-sm sm:text-base text-slate-600">
                  Active Students
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                  95%
                </div>
                <div className="text-sm sm:text-base text-slate-600">
                  Success Rate
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                  50+
                </div>
                <div className="text-sm sm:text-base text-slate-600">
                  Courses Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Powerful Features for Success
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to prepare effectively and excel in your exams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600">
              Three simple steps to exam success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Choose Your Course",
                desc: "Browse VU courses and pick the one you're preparing for.",
                href: "/course",
              },
              {
                step: "2",
                title: "Study the Handouts",
                desc: "Read concise, AI-summarized course handouts to revise fast.",
                href: "/features",
              },
              {
                step: "3",
                title: "Solve Past MCQs",
                desc: "Solve real past-paper MCQs and get instant AI explanations for every answer.",
                href: "/features",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <Link
                  href={item.href}
                  className="group flex flex-col items-center rounded-xl p-2 transition-colors hover:bg-slate-50"
                >
                  <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2 text-center group-hover:text-teal-700">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-center">{item.desc}</p>
                </Link>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-teal-500 text-2xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-blue-900 to-blue-800">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Excel in Your Exams?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already preparing smarter with
            ExamPrep AI
          </p>
          <Link href="/course" className="inline-block">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-lg">
              Explore Courses
            </Button>
          </Link>
        </div>
      </section>

      {/* Explore more — a hub of internal links so crawlers (and students)
          can reach every key page from the homepage. */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-2xl font-bold text-blue-900">
            Explore ExamPrep AI
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                heading: "Study Tools",
                links: [
                  { label: "All Features", href: "/features" },
                  { label: "Browse Courses", href: "/course" },
                  { label: "Contribute a PDF", href: "/contribute" },
                ],
              },
              {
                heading: "Learn",
                links: [
                  { label: "Blog & Study Tips", href: "/blog" },
                  { label: "About ExamPrep AI", href: "/about" },
                  { label: "Contact Us", href: "/contact" },
                ],
              },
              {
                heading: "Get Started",
                links: [
                  { label: "Create Free Account", href: "/signup" },
                  { label: "Login", href: "/login" },
                  { label: "Explore Courses", href: "/course" },
                ],
              },
              {
                heading: "Legal",
                links: [
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                  {col.heading}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-slate-700 transition-colors hover:text-teal-700"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
