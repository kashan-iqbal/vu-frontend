import { coursesBySubject } from "../data/subject";

export interface Course {
  code: string;
  title: string;
  level?: string;
  credits?: number;
  link?: string;
  subject: string;
}

type RawCourse = Omit<Course, "subject"> & Record<string, unknown>;

/**
 * Flattened, de-duplicated list of every VU course in `subject.ts`, tagged with
 * its subject group. Used to statically generate the public handout pages and
 * their sitemap entries. Codes are treated case-insensitively.
 */
export const allCourses: Course[] = (() => {
  const seen = new Set<string>();
  const out: Course[] = [];
  for (const [subject, list] of Object.entries(
    coursesBySubject as Record<string, RawCourse[]>,
  )) {
    for (const c of list) {
      const key = c.code.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        code: c.code,
        title: c.title,
        level: c.level,
        credits: c.credits,
        link: c.link,
        subject,
      });
    }
  }
  return out;
})();

const byCode = new Map(allCourses.map((c) => [c.code.toUpperCase(), c]));

export function getCourseByCode(code: string): Course | undefined {
  return byCode.get(code.toUpperCase());
}

const bySubject = (() => {
  const m = new Map<string, Course[]>();
  for (const c of allCourses) {
    const arr = m.get(c.subject);
    if (arr) arr.push(c);
    else m.set(c.subject, [c]);
  }
  return m;
})();

/**
 * Other VU courses in the same subject group as `code`, for a "Related courses"
 * internal-link block on handout pages. Builds topical clusters and gives
 * crawlers deeper paths into the catalogue. Returns [] for unknown codes.
 */
export function getRelatedCourses(code: string, limit = 6): Course[] {
  const course = getCourseByCode(code);
  if (!course) return [];
  const upper = code.toUpperCase();
  return (bySubject.get(course.subject) ?? [])
    .filter((c) => c.code.toUpperCase() !== upper)
    .slice(0, limit);
}
