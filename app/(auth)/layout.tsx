import type { Metadata } from "next";
import { AuthGuard } from "../components/AuthGuard";
import { AuthProviders } from "../provider/googleProvider";

// Auth screens carry no indexable content — keep them out of search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// The Google Identity SDK (GoogleOAuthProvider) is scoped HERE — only the
// login/signup/forgot-password pages need it — so the ~96 KiB GSI script no
// longer loads on every public page.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProviders>
      <AuthGuard mode="guest">{children}</AuthGuard>
    </AuthProviders>
  );
}
