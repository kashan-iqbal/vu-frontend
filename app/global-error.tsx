"use client";

import { useEffect } from "react";

/**
 * Global error boundary. Catches errors thrown in the root layout itself.
 * Must render its own <html>/<body> because it replaces the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
          color: "#1e3a8a",
        }}
      >
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: "1rem", maxWidth: "28rem", color: "#475569" }}>
          A critical error occurred while loading the application. Please try
          again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "2rem",
            background: "#14b8a6",
            color: "#fff",
            border: 0,
            borderRadius: "0.5rem",
            padding: "0.75rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
