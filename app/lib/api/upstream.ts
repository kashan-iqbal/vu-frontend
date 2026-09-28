import "server-only";

/**
 * Shared upstream-fetch policy for the public SSG/ISR content pages.
 *
 * WHY THIS EXISTS — the 2026-08 incident, in one paragraph: the old fetchers
 * returned `null` / `[]` for BOTH "the API says this doesn't exist (404)" and
 * "the API failed to answer". The page templates then rendered `notFound()`,
 * which bakes `noindex` into a static prerender. A slow/throttled backend
 * therefore froze ~180 pages as noindex and Google de-indexed them over the
 * following six weeks. See vuexamprep.com-audit/VALIDATION-REPORT.md.
 *
 * The rule this module enforces: **only a 404 may ever produce a noindex page.**
 * Anything else — 429, 5xx, timeout, DNS, socket reset — throws. A throw is the
 * safe failure mode:
 *   - at `next build`  → the deploy fails loudly instead of shipping poison;
 *   - during ISR       → Next keeps serving the last good prerender (stale-on-error)
 *                        and retries on the next revalidation.
 * Both are strictly better than caching a wrong `noindex` for 24 hours.
 */

/** The endpoint answered 404: the resource genuinely does not exist. */
export const NOT_FOUND = Symbol("upstream-not-found");
export type NotFound = typeof NOT_FOUND;

const RAW_API_BASE_ENV = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Off-platform the localhost default is a convenience. Inside a Vercel build
 * container nothing listens on :3030, so an unset variable silently spends six
 * retries and ~30 s of backoff before failing as "fetch failed" — which reads
 * like a backend outage rather than a missing setting (2026-09-28). A variable
 * scoped to Production only does exactly this to every Preview build.
 */
if (!RAW_API_BASE_ENV && process.env.VERCEL) {
  throw new Error(
    `NEXT_PUBLIC_API_BASE_URL is not set for VERCEL_ENV=${process.env.VERCEL_ENV ?? "unknown"}. ` +
      `Set it to e.g. https://api.vuexamprep.com/api/v1 and tick Production, ` +
      `Preview and Development — scoping it to Production alone leaves Preview ` +
      `builds falling back to localhost.`,
  );
}

const RAW_API_BASE = (RAW_API_BASE_ENV ?? "http://localhost:3030/api/v1").replace(
  /\/$/,
  "",
);

/**
 * A misconfigured base otherwise surfaces six retries deep as an opaque
 * "Failed to parse URL from NEXT_PUBLIC_API_BASE_URL/handout" (2026-09-27: the
 * variable's own name had been pasted into Vercel's *value* field). Fail at
 * import instead, naming the cause.
 */
function assertAbsolute(base: string): string {
  try {
    new URL(base);
    return base;
  } catch {
    throw new Error(
      `NEXT_PUBLIC_API_BASE_URL is not an absolute URL: ${JSON.stringify(base)}. ` +
        `Expected e.g. https://api.vuexamprep.com/api/v1 — check the Vercel ` +
        `environment variable's value, not just its name.`,
    );
  }
}

export const API_BASE = assertAbsolute(RAW_API_BASE);

/** Content changes rarely; refresh once a day without a redeploy. */
export const REVALIDATE_SECONDS = 86_400;

/**
 * The origin is slow (measured 2026-09-26: ~3.1 s average, 5.2 s p-max for a
 * single handout read at only 12-way concurrency, 170–310 KB payloads). The old
 * 4 attempts / ~4.5 s of total backoff was inside that failure envelope, so a
 * merely-slow backend still produced noindex pages. These numbers give a
 * transient blip ~30 s of patience while still bounding a build.
 */
const MAX_ATTEMPTS = 6;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_BACKOFF_MS = 8_000;

/** Thrown when the upstream could not be reached or did not answer usefully. */
export class UpstreamUnavailableError extends Error {
  constructor(
    readonly url: string,
    readonly detail: string,
  ) {
    super(
      `Upstream unavailable after ${MAX_ATTEMPTS} attempts: ${url} (${detail}). ` +
        `Refusing to render this as "no content" — that is what de-indexed ~180 ` +
        `pages in 2026-08.`,
    );
    this.name = "UpstreamUnavailableError";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function backoffMs(attempt: number, retryAfter: string | null): number {
  const parsed = retryAfter ? Number(retryAfter) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(parsed * 1000, MAX_BACKOFF_MS);
  }
  return Math.min(500 * 2 ** attempt, MAX_BACKOFF_MS); // 500ms, 1s, 2s, 4s, 8s
}

/**
 * Fetch JSON from the content API.
 *
 * @returns the parsed body, or NOT_FOUND on a genuine 404.
 * @throws  UpstreamUnavailableError on any transient failure, so callers can
 *          never mistake "unreachable" for "absent".
 */
export async function fetchContentJson<T>(
  url: string,
  tag: string,
): Promise<T | NotFound> {
  let lastDetail = "unknown";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      // An explicit per-request deadline. Without this a hung socket could stall
      // a build indefinitely — `fetch` has no default timeout.
      const res = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        next: { revalidate: REVALIDATE_SECONDS, tags: [tag] },
      });

      if (res.status === 404) return NOT_FOUND;

      if (res.ok) {
        try {
          return (await res.json()) as T;
        } catch {
          // A 200 with an unparseable body is a broken upstream, not absent
          // content — e.g. an nginx error page served with the wrong status.
          lastDetail = "200 with unparseable JSON body";
          if (attempt < MAX_ATTEMPTS - 1) {
            await sleep(backoffMs(attempt, null));
            continue;
          }
          break;
        }
      }

      lastDetail = `HTTP ${res.status}`;
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(backoffMs(attempt, res.headers.get("retry-after")));
        continue;
      }
      break;
    } catch (err) {
      // Timeout, DNS failure, socket reset — all transient.
      lastDetail = err instanceof Error ? `${err.name}: ${err.message}` : "network error";
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(backoffMs(attempt, null));
        continue;
      }
      break;
    }
  }

  throw new UpstreamUnavailableError(url, lastDetail);
}

/**
 * The lenient variant, for OPTIONAL page enrichment only — deciding whether to
 * render a cross-link, for example. It swallows a transient failure and returns
 * the fallback, which is safe precisely because the result cannot influence
 * whether the page is indexable.
 *
 * NEVER use this for the content a page's existence depends on.
 */
export async function tryFetchContentJson<T>(
  url: string,
  tag: string,
  fallback: T,
): Promise<T> {
  try {
    const data = await fetchContentJson<T>(url, tag);
    return data === NOT_FOUND ? fallback : data;
  } catch {
    return fallback;
  }
}
