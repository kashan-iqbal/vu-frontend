import TopicReviewClient from "@/components/TopicReviewClient";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  // `code` here is the full quizCode, e.g. "finalterm-CS101".
  const { code } = await params;
  return <TopicReviewClient quizCode={code} />;
}
