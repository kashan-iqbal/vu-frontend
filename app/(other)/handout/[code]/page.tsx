import { redirect } from "next/navigation";

// /handout/<code> → default to the midterm summary.
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/handout/${code}/midterm`);
}
