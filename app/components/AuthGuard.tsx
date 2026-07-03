"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-user";

/**
 * Client-side route protection based on the same `/user/me` signal the Header
 * uses (React Query key ["me"]). This is the app's reliable source of truth for
 * "am I logged in", because the auth cookie is set by the API origin and is not
 * readable by the Next.js server/middleware — so route guarding must happen
 * against the API, not a server-read cookie.
 *
 * - mode "require": block app routes for logged-out users → redirect to /login.
 * - mode "guest":   keep logged-in users out of auth pages → redirect to /course.
 */
export function AuthGuard({
  children,
  mode = "require",
}: {
  children: React.ReactNode;
  mode?: "require" | "guest";
}) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  const isAuthed = Boolean(user);

  useEffect(() => {
    if (isLoading) return;
    if (mode === "require" && isError) {
      router.replace("/login");
    } else if (mode === "guest" && isAuthed) {
      router.replace("/course");
    }
  }, [isLoading, isError, isAuthed, mode, router]);

  // Require mode: never render protected content until we know the user is authed.
  if (mode === "require" && (isLoading || !isAuthed)) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  // Guest mode: render the auth page immediately; only redirect if we discover
  // the user is already logged in.
  if (mode === "guest" && isAuthed) {
    return null;
  }

  return <>{children}</>;
}
