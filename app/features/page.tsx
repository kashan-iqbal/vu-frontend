import type { Metadata } from "next";
import Link from "next/link";
import {
  Brain,
  Sparkles,
  Volume2,
  FileText,
  BarChart3,
  Target,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Features — AI Quizzes, Topic Review & Performance Tracking | ExamPrep AI",
  description:
    "Explore ExamPrep AI features: adaptive MCQ quizzes that target your weak topics, AI-generated topic reviews you can listen to, course handouts, and detailed performance analytics to boost your exam scores.",
};

const features = [
  {
    icon: Brain,
    title: "Adaptive MCQ Quizzes",
    description:
      "Practice with multiple-choice quizzes that adapt to you. The smart quiz pulls more questions from the topics you previously got wrong, so every attempt targets your real weak spots.",
  },
  {
    icon: Sparkles,
    title: "AI Topic Review",
    description:
      "After a quiz, get concise, AI-generated explanations for the exact topics you missed — written for quick exam revision, grounded in the questions you actually answered incorrectly.",
  },
  {
    icon: Volume2,
    title: "Listen to Explanations",
    description:
      "Prefer to revise on the go? Tap the speaker on any AI explanation to have it read aloud, so you can review while commuting or resting your eyes.",
  },
  {
    icon: CheckCircle,
    title: "Instant Feedback",
    description:
      "See correct and incorrect answers the moment you respond, with clear explanations for each question — no waiting until the end to learn from mistakes.",
  },
  {
    icon: FileText,
    title: "Course Handouts",
    description:
      "Access clean, readable course summaries and handouts for quick reference right next to your practice quizzes.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Every quiz ends with a breakdown: total questions, correct vs. wrong, and the specific topics that need more work.",
  },
];

const performance = [
  {
    icon: Target,
    title: "Weak-topic detection",
    text: "We record the topics behind every wrong answer, so your weak areas are identified automatically — no manual tracking.",
  },
  {
    icon: TrendingUp,
    title: "Smarter retesting",
    text: "Your next quiz is weighted toward those weak topics, mixed with fresh questions, so you reinforce exactly what you keep missing.",
  },
  {
    icon: BarChart3,
    title: "Clear score breakdowns",
    text: "Correct, wrong, and per-topic results after each attempt make your progress measurable and your study time focused.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 py-20">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything you need to ace your exams
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            ExamPrep AI turns practice into progress — adaptive quizzes, AI
            explanations you can listen to, and analytics that show you exactly
            what to study next.
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white p-8 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Student performance */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Built around your performance
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              ExamPrep AI doesn&apos;t just test you — it learns where you
              struggle and helps you close the gap before exam day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {performance.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-white p-8 rounded-xl border border-slate-200"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-900" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start practicing smarter today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Pick a course, take a quiz, and let ExamPrep AI guide your revision.
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
