import { notFound } from "next/navigation";
import PastMcqsClient from "../../../components/PastMcqsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!code) return notFound();

  return <PastMcqsClient code={code} />;
}
