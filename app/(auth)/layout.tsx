import type { Metadata } from "next";
import { AuthGuard } from "../components/AuthGuard";

// Auth screens carry no indexable content — keep them out of search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Keep already-logged-in users out of the login/signup/forgot-password pages.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard mode="guest">{children}</AuthGuard>;
}
