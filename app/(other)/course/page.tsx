"use client";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Clock,
  ArrowRight,
  Search,
  ChevronRight,
  Download,
  Dock,
  View,
} from "lucide-react";
import { useState } from "react";
import { coursesBySubject } from "../../data/subject";
import Link from "next/link";

/**
 * Courses Page - Modern Academic Minimalism Design
 * Subject-based course listing with course codes (CS301, CS400, etc.)
 */
export default function Courses() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const subjects = [
    {
      id: "acc",
      name: "Associate Degree Programs",
      code: "ACC",
      icon: "📚",
      description: "Program in Associate Degree Programs",
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "bif",
      name: "Bioinformatics",
      code: "BIF",
      icon: "🧬",
      description: "Program in Bioinformatics",
      color: "from-purple-600 to-purple-700",
    },
    {
      id: "bio",
      name: "Biological Sciences",
      code: "BIO",
      icon: "🔬",
      description: "Program in Biological Sciences",
      color: "from-green-600 to-green-700",
    },
    {
      id: "bnk",
      name: "Banking",
      code: "BNK",
      icon: "🏦",
      description: "Program in Banking",
      color: "from-orange-600 to-orange-700",
    },
    {
      id: "bt",
      name: "Biotechnology",
      code: "BT",
      icon: "🧫",
      description: "Program in Biotechnology",
      color: "from-red-600 to-red-700",
    },
    {
      id: "che",
      name: "Chemistry",
      code: "CHE",
      icon: "⚗️",
      description: "Program in Chemistry",
      color: "from-indigo-600 to-indigo-700",
    },
    {
      id: "cs",
      name: "Computer Science",
      code: "CS",
      icon: "💻",
      description: "Program in Computer Science",
      color: "from-cyan-600 to-cyan-700",
    },
    {
      id: "eco",
      name: "Economics",
      code: "ECO",
      icon: "📈",
      description: "Program in Economics",
      color: "from-yellow-600 to-yellow-700",
    },
    {
      id: "eng",
      name: "English",
      code: "ENG",
      icon: "✍️",
      description: "Program in English",
      color: "from-rose-600 to-rose-700",
    },
    {
      id: "eth",
      name: "Ethics",
      code: "ETH",
      icon: "⚖️",
      description: "Program in Ethics",
      color: "from-slate-600 to-slate-700",
    },
    {
      id: "fin",
      name: "Finance",
      code: "FIN",
      icon: "💰",
      description: "Program in Finance",
      color: "from-emerald-700 to-emerald-800",
    },
    {
      id: "gen",
      name: "General Science",
      code: "GEN",
      icon: "🔭",
      description: "Program in General Science",
      color: "from-violet-600 to-violet-700",
    },
    {
      id: "hrm",
      name: "Human Resource Management",
      code: "HRM",
      icon: "🤝",
      description: "Program in Human Resource Management",
      color: "from-fuchsia-600 to-fuchsia-700",
    },
    {
      id: "it",
      name: "Information Technology",
      code: "IT",
      icon: "🖥️",
      description: "Program in Information Technology",
      color: "from-blue-700 to-blue-800",
    },
    {
      id: "isl",
      name: "Islamic Studies",
      code: "ISL",
      icon: "🕌",
      description: "Program in Islamic Studies",
      color: "from-green-700 to-green-800",
    },
    {
      id: "mgt",
      name: "Management",
      code: "MGT",
      icon: "📋",
      description: "Program in Management",
      color: "from-amber-700 to-amber-800",
    },
    {
      id: "mkt",
      name: "Marketing",
      code: "MKT",
      icon: "📣",
      description: "Program in Marketing",
      color: "from-pink-600 to-pink-700",
    },
    {
      id: "msc",
      name: "Mass Communication",
      code: "MSC",
      icon: "📡",
      description: "Program in Mass Communication",
      color: "from-red-700 to-red-800",
    },
    {
      id: "mat",
      name: "Mathematics",
      code: "MAT",
      icon: "🧮",
      description: "Program in Mathematics",
      color: "from-indigo-700 to-indigo-800",
    },
    {
      id: "pak",
      name: "Pakistan Studies",
      code: "PAK",
      icon: "🇵🇰",
      description: "Program in Pakistan Studies",
      color: "from-green-800 to-green-900",
    },
    {
      id: "phy",
      name: "Physics",
      code: "PHY",
      icon: "⚛️",
      description: "Program in Physics",
      color: "from-cyan-700 to-cyan-800",
    },
    {
      id: "psc",
      name: "Public International Law",
      code: "PSC",
      icon: "🌐",
      description: "Program in Public International Law",
      color: "from-amber-600 to-amber-700",
    },
    {
      id: "psy",
      name: "Psychology",
      code: "PSY",
      icon: "🧠",
      description: "Program in Psychology",
      color: "from-pink-700 to-pink-800",
    },
    {
      id: "pub",
      name: "Public Administration",
      code: "PUB",
      icon: "🏛️",
      description: "Program in Public Administration",
      color: "from-stone-600 to-stone-700",
    },
    {
      id: "soc",
      name: "Sociology",
      code: "SOC",
      icon: "👥",
      description: "Program in Sociology",
      color: "from-teal-600 to-teal-700",
    },
    {
      id: "sta",
      name: "Statistics",
      code: "STA",
      icon: "📊",
      description: "Program in Statistics",
      color: "from-lime-600 to-lime-700",
    },
    {
      id: "urd",
      name: "Urdu",
      code: "URD",
      icon: "📖",
      description: "Program in Urdu",
      color: "from-emerald-600 to-emerald-700",
    },
    {
      id: "zoo",
      name: "Zoology",
      code: "ZOO",
      icon: "🐘",
      description: "Program in Zoology",
      color: "from-sky-600 to-sky-700",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-blue-50 to-slate-50 py-6">
          <div className="container max-w-7xl mx-auto px-4 ">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Choose Your Subject
            </h1>
            <p className="text-lg text-slate-600">
              Select a subject to explore all available courses with different
              difficulty levels
            </p>
          </div>
        </section>

        {/* Subjects Grid */}
        <section className="py-16 bg-white">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/course/${subject.id}`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 hover:border-teal-300 transition-all duration-300"
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  ></div>

                  {/* Content */}
                  <div className="relative p-6 h-full flex flex-col">
                    <div className="text-5xl mb-4">{subject.icon}</div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-1">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 flex-grow">
                      {subject.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        {subject.code}
                      </span>
                      <ChevronRight className="w-5 h-5 text-teal-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
