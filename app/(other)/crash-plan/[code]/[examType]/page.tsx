import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CrashPlanClient from "@/components/CrashPlanClient";

const TERMS = ["midterm", "finalterm"] as const;
type Term = (typeof TERMS)[number];
const isTerm = (t: string): t is Term => (TERMS as readonly string[]).includes(t);

// Personalised, per-user tool — keep it out of search indexes.
export const metadata: Metadata = {
  title: "Exam Crash Plan",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ code: string; examType: string }>;
}) {
  const { code, examType } = await params;
  const term = examType.toLowerCase();
  if (!isTerm(term)) return notFound();

  return <CrashPlanClient code={code.toUpperCase()} examType={term} />;
}
