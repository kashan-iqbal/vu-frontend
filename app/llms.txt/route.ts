import { siteConfig, absoluteUrl } from "../lib/seo/site";

// Serves /llms.txt — an optional, emerging convention that lets AI tools locate
// a site's canonical, high-value content. Google ignores it, but some AI
// assistants use it. Kept in sync with siteConfig so it follows the env origin.
export const dynamic = "force-static";

export function GET() {
  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} is an independent, AI-powered exam-preparation platform for
Virtual University of Pakistan (VU) students. It is not affiliated with Virtual
University. Content is written to help VU students prepare for midterm and final
term exams with adaptive MCQ practice, solvable past-paper MCQs, AI topic
explanations, and per-course handouts.

## Key pages
- [Home](${absoluteUrl("/")}): Overview of the platform.
- [Features](${absoluteUrl("/features")}): What the tool does.
- [About](${absoluteUrl("/about")}): Who builds it and why.
- [Blog](${absoluteUrl("/blog")}): VU study guides (grading scheme, exam pattern, midterm prep).
- [Contact](${absoluteUrl("/contact")}): Get in touch.

## Guides
- [VU Grading Scheme & GPA Explained](${absoluteUrl("/blog/vu-grading-scheme-gpa-explained")})
- [VU Exam Pattern: Midterm & Final Term](${absoluteUrl("/blog/vu-exam-pattern-midterm-finalterm")})
- [VU Midterm Preparation Guide](${absoluteUrl("/blog/vu-midterm-preparation-guide")})

## Course handouts
Per-course handout pages live under ${absoluteUrl("/handout/{COURSE_CODE}/{midterm|finalterm}")},
e.g. ${absoluteUrl("/handout/CS201/finalterm")}. A complete list is in the sitemap.

## Canonical resources
- Sitemap: ${absoluteUrl("/sitemap.xml")}
- Contact: ${siteConfig.supportEmail}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
