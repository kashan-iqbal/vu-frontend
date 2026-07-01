import { notFound } from "next/navigation";
import HandoutClient from "@/components/HandoutClient";

const VALID_TERMS = ["midterm", "finalterm"] as const;
type Term = (typeof VALID_TERMS)[number];

// Handouts are auth-gated, so they're fetched client-side (cookie sent via the
// browser client) rather than statically generated.
export default async function Page({
  params,
}: {
  params: Promise<{ code: string; examType: string }>;
}) {
  const { code, examType } = await params;
  if (!VALID_TERMS.includes(examType as Term)) return notFound();

  return <HandoutClient code={code} examType={examType as Term} />;
}
