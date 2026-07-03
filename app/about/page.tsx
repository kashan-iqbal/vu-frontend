import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Target, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "About Us — Our Mission to Help Students Succeed",
  description:
    "ExamPrep AI is an independent study platform built to help university students prepare smarter with adaptive quizzes and AI-powered explanations. Learn about our vision, goals, and the students we serve.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: Eye,
    title: "Our Vision",
    text: "A world where every student can prepare for exams with confidence — using affordable, intelligent tools that adapt to how they actually learn, not a one-size-fits-all textbook.",
  },
  {
    icon: Target,
    title: "Our Goal",
    text: "To turn passive studying into active, measurable progress. We help students find their weak topics fast, understand them deeply with AI explanations, and retest until the concepts stick.",
  },
  {
    icon: Users,
    title: "Who We Help",
    text: "University students preparing for midterm and final exams — especially self-paced learners who need focused practice, instant feedback, and revision they can fit around a busy schedule.",
  },
  {
    icon: Heart,
    title: "What We Value",
    text: "Accuracy, accessibility, and honesty. We keep the experience simple, our explanations clear, and we never pretend to be an official institution — we're an independent helper on your side.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 py-20">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Helping students prepare smarter
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            ExamPrep AI was built on a simple belief: studying should be
            focused, measurable, and a little less stressful. We combine
            adaptive practice with AI explanations so you spend your time on
            what actually moves your grade.
          </p>
        </div>
      </section>

      {/* Mission statement */}
      <section className="py-20 bg-white">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Our Mission</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Too many students study hard but not smart — re-reading material they
            already know and skipping the topics that cost them marks. ExamPrep
            AI exists to fix that. By tracking the topics behind every wrong
            answer and turning them into clear, bite-sized AI explanations, we
            help you target your weak areas and walk into the exam hall
            prepared.
          </p>
        </div>
      </section>

      {/* Values grid */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="bg-white p-8 rounded-xl border border-slate-200"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {v.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What we aim to achieve */}
      <section className="py-20 bg-white">
        <div className="container max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
            What we aim to achieve
          </h2>
          <ul className="space-y-4 text-slate-600">
            {[
              "Make exam preparation affordable and accessible to every student.",
              "Help learners identify and fix their weak topics before exam day.",
              "Replace anxiety with clear, measurable progress after every quiz.",
              "Provide trustworthy explanations that turn mistakes into understanding.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join students preparing smarter
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Explore your courses and start turning practice into progress.
          </p>
          <Link href="/course">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold text-lg">
              Explore Courses
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
