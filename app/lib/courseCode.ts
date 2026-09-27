/**
 * Course-code canonicalisation for the public /handout and /past-papers URLs.
 *
 * WHY: the backend is case-insensitive, so /handout/CS201/finalterm,
 * /handout/cs201/finalterm and /handout/Cs201/finalterm all used to return 200
 * — each with a SELF-referential canonical. Every course therefore exposed an
 * indexable duplicate per casing variant, and Google had to pick a winner and
 * file the rest under "Duplicate / not indexed".
 *
 * ONE canonical spelling: uppercase, which is what the API list and the sitemap
 * already emit. `middleware.ts` 308-redirects every other casing onto it, so old
 * lowercase links keep working without minting duplicate URLs.
 *
 * Deliberately NOT marked "server-only": middleware imports this too.
 */

/** The canonical spelling of a course code as it appears in a URL. */
export function canonicalCourseCode(code: string): string {
  return code.toUpperCase();
}

/** True when `code` is already in its canonical spelling. */
export function isCanonicalCourseCode(code: string): boolean {
  return code === canonicalCourseCode(code);
}
