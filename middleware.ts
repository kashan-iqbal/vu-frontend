import { NextResponse, type NextRequest } from "next/server";
import { canonicalCourseCode } from "@/lib/courseCode";

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
