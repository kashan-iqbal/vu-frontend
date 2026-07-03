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
