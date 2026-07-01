import { notFound } from "next/navigation";
import QuizClient from "../../../components/QuizClient";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!code) return notFound();

  return <QuizClient code={code} />;
}
