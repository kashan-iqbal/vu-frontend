"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-user";
import {
  readNextParam,
  withNext,
  currentPathWithQuery,
} from "@/lib/redirect";

/**
 * Client-side route protection based on the same `/user/me` signal the Header
 * uses (React Query key ["me"]). This is the app's reliable source of truth for
 * "am I logged in", because the auth cookie is set by the API origin and is not
 * readable by the Next.js server/middleware — so route guarding must happen
 * against the API, not a server-read cookie.
 *
 * - mode "require": block app routes for logged-out users → redirect to /login,
 *   carrying the attempted path as `next` so they land back here after signing
 *   in (this is what makes a shared link to a protected page work).
 * - mode "guest":   keep logged-in users out of auth pages → send them to `next`
 *   when one was carried in, otherwise /course.
 */
export function AuthGuard({
  children,
  mode = "require",
}: {
  children: React.ReactNode;
  mode?: "require" | "guest";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError } = useCurrentUser();

  const isAuthed = Boolean(user);

  useEffect(() => {
    if (isLoading) return;
    if (mode === "require" && isError) {
      // "/" is the default landing spot, so there's nothing worth returning to.
      const next = pathname === "/" ? null : currentPathWithQuery(pathname);
      router.replace(withNext("/login", next));
    } else if (mode === "guest" && isAuthed) {
      router.replace(readNextParam() ?? "/course");
    }
  }, [isLoading, isError, isAuthed, mode, router, pathname]);

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
