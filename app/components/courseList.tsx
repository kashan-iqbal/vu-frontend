"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  History,
  FileText,
  Brain,
  Eye,
  PlayCircle,
  BookOpen,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // adjust import to your path
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Course = {
  code: string;
  title: string;
  level: string;
  students: number;
  credits: number;
  link?: string;
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-green-100 text-green-700";
    case "Intermediate":
      return "bg-yellow-100 text-yellow-700";
    case "Advanced":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function CourseList({
  courses,
  initialQuery,
}: {
  courses: Course[];
  initialQuery: string;
}) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushToUrl = useCallback(
    (value: string) => {
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname],
  );

  const updateSearch = (value: string) => {
    setSearchTerm(value); // keep input responsive immediately

    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => pushToUrl(value), 400);
  };

  // cleanup pending timer on unmount
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const handleViewHandout = (link?: string) => {
    if (!link) return;

    let url = link;

    // Normalize any Google Drive link to the preview form (opens, not downloads)
    const driveMatch = link.match(
      /drive\.google\.com\/(?:file\/d\/|.*[?&]id=)([\w-]+)/,
    );
    if (driveMatch) {
      url = `https://drive.google.com/file/d/${driveMatch[1]}/view`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section className="bg-linear-to-br from-blue-50 to-slate-50 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <Link
            href="/course"
            className="mb-4 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Subjects
          </Link>

          <p className="text-lg text-slate-600 mb-6">
            {courses.length} courses available in this subject
          </p>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course code or title..."
              value={searchTerm}
              onChange={(e) => updateSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course, index) => (
                <article
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-lg hover:border-teal-300"
                >
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
                          {course.code}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-blue-900 leading-tight">
                          {course.title}
                        </h2>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getLevelColor(course.level)}`}
                      >
                        {course.level}
                      </span>
                    </div>

                    {/* Action grid */}
                    <div className="grid grid-cols-2 gap-4 mt-6 mb-8">
                      <button
                        type="button"
                        onClick={() => setComingSoonOpen(true)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors group/link text-left"
                      >
                        <History className="w-5 h-5 text-teal-500/70 group-hover/link:text-teal-600" />
                        <span className="text-sm font-medium">Past MCQs</span>
                      </button>

                      <Link
                        href={`/handout/${course.code}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors group/link"
                      >
                        <FileText className="w-5 h-5 text-teal-500/70 group-hover/link:text-teal-600" />
                        <span className="text-sm font-medium">
                          Short Handout
                        </span>
                      </Link>

                      <Link
                        href={`/quiz/${course.code}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors group/link text-left"
                      >
                        <Brain className="w-5 h-5 text-teal-500/70 group-hover/link:text-teal-600" />
                        <span className="text-sm font-medium">
                          Practice MCQS
                        </span>
                      </Link>

                      <button
                        onClick={() => handleViewHandout(course?.link)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors group/link text-left"
                      >
                        <Eye className="w-5 h-5 text-teal-500/70 group-hover/link:text-teal-600" />
                        <span className="text-sm font-medium">
                          Full Handout
                        </span>
                      </button>
                    </div>

                    {/* Primary CTA */}
                    <div className="mt-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setComingSoonOpen(true)}
                        className="w-full bg-teal-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-bold shadow-sm hover:bg-teal-600 transition-all active:scale-95"
                      >
                        <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span>Midterm Video</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setComingSoonOpen(true)}
                        className="w-full bg-teal-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-bold shadow-sm hover:bg-teal-600 transition-all active:scale-95"
                      >
                        <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span>Final Term Video</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-700 mb-2">
                No courses found
              </h3>
              <p className="text-slate-600">
                Try adjusting your search or select a different subject
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Coming soon popup (Past MCQs / AI Practice) */}
      <Dialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
        <DialogContent className="text-center sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-blue-900">🚧 Coming soon</DialogTitle>
            <DialogDescription>
              We&apos;re putting the finishing touches on this feature. Please
              check back shortly!
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button className="w-full bg-blue-900 font-semibold text-white hover:bg-blue-800">
              Got it
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
