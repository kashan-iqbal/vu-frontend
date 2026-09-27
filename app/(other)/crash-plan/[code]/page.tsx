import type { Metadata } from "next";
import CrashPlanStart from "@/components/CrashPlanStart";

// Personalised, per-user tool — keep it out of search indexes.
export const metadata: Metadata = {
  title: "Exam Crash Plan",
  robots: { index: false, follow: false },
};

// Landing step of the crash-plan journey: pick the exam and the hours left.
// Generating hands off to /crash-plan/<code>/<examType>, which renders the plan.
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return <CrashPlanStart code={code.toUpperCase()} />;
}
