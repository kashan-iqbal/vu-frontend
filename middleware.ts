import { NextResponse, type NextRequest } from "next/server";
import { canonicalCourseCode } from "@/lib/courseCode";
import { handoutPreferredTerm } from "@/data/handoutTerms";

/**
 * Canonicalise the course-code segment of the public content URLs.
 *
 * TWO problems this solves at once:
 *
 * 1. DUPLICATES. The backend is case-insensitive, so /handout/CS201/finalterm,
 *    /handout/cs201/finalterm and /handout/Cs201/finalterm all returned 200 — each
 *    with a self-referential canonical. Every course exposed an indexable duplicate
 *    per casing variant, which Google files under "Duplicate / not indexed".
 *
 * 2. Both content templates now set `dynamicParams = false`, so an unknown code gives
 *    a real 404 instead of a 200 + noindex soft-404. Their static params come from
 *    the API in UPPERCASE, so without this redirect every existing lowercase link
 *    would start 404-ing. A 308 keeps those links working and folds them onto one URL.
 *
 * Runs before routing, so the redirected path is what gets matched.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /handout/<code>[/<examType>] and /past-papers/<code>/<examType>
  const match = /^\/(handout|past-papers)\/([^/]+)(\/.*)?$/.exec(pathname);
  if (!match) return NextResponse.next();

  // ── Forward the bare /handout/<CODE> to its term page with a REAL 308 ──
  //
  // The page itself cannot do this reliably: it has to know which term exists,
  // and awaiting the API before redirect() lets Next stream the <head> first, so
  // the response is already committed as 200 and the redirect degrades to a
  // client-side one. That is what put 141 URLs in Search Console's
  // "Excluded by 'noindex' tag" bucket — see app/handout/[code]/page.tsx.
  //
  // Middleware runs BEFORE any rendering, so nothing has been streamed yet and a
  // genuine 308 is possible. The term comes from a build-time map, so there is no
  // request-time API call to lose the race against.
  //
  // A code absent from the map falls through to the SSG page, which still forwards
  // correctly (just client-side) — so a stale map degrades, it never breaks.
  if (match[1] === "handout" && !match[3]) {
    let bare: string;
    try {
      bare = decodeURIComponent(match[2]);
    } catch {
      return NextResponse.next();
    }
    const code = canonicalCourseCode(bare);
    const term = handoutPreferredTerm[code];
    if (term) {
      const url = req.nextUrl.clone();
      url.pathname = `/handout/${encodeURIComponent(code)}/${term}`;
      return NextResponse.redirect(url, 308);
    }
  }

  const [, section, rawCode, rest = ""] = match;

  let decoded: string;
  try {
    decoded = decodeURIComponent(rawCode);
  } catch {
    // Malformed percent-encoding — let the router deal with it (404).
    return NextResponse.next();
  }

  const code = canonicalCourseCode(decoded);
  if (code === decoded) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${section}/${encodeURIComponent(code)}${rest}`;
  // 308, not 307: permanent, and preserves the method. Tells Google the uppercase
  // spelling is the one to keep.
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Scoped tightly — no other route should pay for an edge hop.
  matcher: ["/handout/:path*", "/past-papers/:path*"],
};
