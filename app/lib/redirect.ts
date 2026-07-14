// Helpers for the "send me back where I came from" auth flow.
//
// A shared link to a protected page (e.g. /contribute) bounces through /login,
// so the intended destination rides along as a `next` query param and the auth
// pages hand the user back to it afterwards.
//
// These read `window.location` rather than useSearchParams() on purpose: it
// keeps callers free of the Suspense boundary that useSearchParams() forces on
// statically-rendered routes.

/**
 * Only same-origin absolute paths are allowed through, so a crafted
 * `?next=https://evil.example` (or protocol-relative `//evil.example`) can't
 * turn login into an open redirect.
 */
export function sanitizeNext(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  return raw;
}

/** The validated `next` destination from the current URL, if any. */
export function readNextParam(): string | null {
  if (typeof window === "undefined") return null;
  return sanitizeNext(new URLSearchParams(window.location.search).get("next"));
}

/** Append a `next` param to an internal path (no-op when there's nothing to carry). */
export function withNext(path: string, next: string | null): string {
  const safe = sanitizeNext(next);
  if (!safe) return path;
  return `${path}?next=${encodeURIComponent(safe)}`;
}

/** The current path + query, for use as a `next` value. */
export function currentPathWithQuery(pathname: string): string {
  if (typeof window === "undefined") return pathname;
  return pathname + window.location.search;
}
