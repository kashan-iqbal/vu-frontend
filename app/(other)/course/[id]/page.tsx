import { notFound } from "next/navigation";
import React from "react";
import { coursesBySubject } from "../../../data/subject";
import CourseList from "@/components/courseList";

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) => {
  const { id } = await params;
  const { q } = await searchParams;

  if (!id) {
    return notFound();
  }

  const currentCourses =
    coursesBySubject[id as keyof typeof coursesBySubject] || [];

  const searchTerm = (q || "").toLowerCase();

  const filteredCourses = currentCourses.filter((course) => {
    if (!searchTerm) return true;
    return (
      course.code.toLowerCase().includes(searchTerm) ||
      course.title.toLowerCase().includes(searchTerm)
    );
  });

  return <CourseList courses={filteredCourses} initialQuery={q || ""} />;
};

export default Page;
