// The sticky <Header /> (in the root layout) already reserves its own height in
// normal flow, so feature pages don't need extra top padding here.
import type { Metadata } from "next";
import { AuthGuard } from "../components/AuthGuard";

// These routes are authenticated and user-specific — keep them out of search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function GenericLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard mode="require">{children}</AuthGuard>;
}
