import { Loader2 } from "lucide-react";

/**
 * Root-level loading UI. Enables instant streaming fallback while route
 * segments load, preventing a blank screen and improving perceived performance.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[calc(100vh-64px)] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-900" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
