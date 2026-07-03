"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Route-segment error boundary. Catches render/runtime errors in a segment and
 * offers a recovery action without a full page reload, keeping the shell intact.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for monitoring; replace with your logging/analytics provider.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-3xl font-bold text-blue-900 sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        An unexpected error occurred. You can try again, and if the problem
        persists please contact support.
      </p>
      <div className="mt-8">
        <Button
          onClick={reset}
          className="bg-teal-500 text-white hover:bg-teal-600"
        >
          Try again
        </Button>
      </div>
    </main>
  );
}
