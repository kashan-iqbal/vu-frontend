import { NextRequest, NextResponse } from "next/server";

// Auth pages — logged-in users are bounced away from these.
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];
// Publicly accessible routes (no login required). "/" is the marketing landing,
// plus the marketing/legal pages.
const PUBLIC_ROUTES = [
  "/",
  "/features",
  "/about",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
  ...AUTH_PAGES,
];

// Public if it's an exact public route or a blog post (/blog/<slug>).
function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/blog/");
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Already logged in → keep them out of the auth pages.
  if (token && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/course", request.url));
  }

  // Not logged in → everything except the public routes requires login.
  if (!token && !isPublic(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals, and static files (anything with a dot).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
