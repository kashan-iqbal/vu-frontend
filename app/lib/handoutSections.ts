import { slugify } from "./slug";

/**
 * Split a handout's markdown into one section per top-level `##` heading.
 *
 * ── Why this exists ──
 *
 * Measured 2026-10-31: the 282 handout pages averaged **466 KB of HTML**, with 103
 * over 500 KB and the worst (CS206 final term) at 1.59 MB. Two of four pages tested
 * could not finish loading in Lighthouse at all (`net::ERR_TIMED_OUT`) despite a
 * CDN cache hit and sub-second TTFB — the bytes were the bottleneck. That is the
 * same budget Google's mobile-first crawler works under, and a plausible cause of
 * the 161 pages sitting in "Crawled - currently not indexed".
 *
 * Roughly 46% of each page is the content serialised a second time into the RSC
 * flight payload, which is inherent to the App Router and cannot be optimised away.
 * So the only real lever is less content per URL.
 *
 * `##` is the right boundary because VU handouts are structured per lecture:
 *   # CS201 — Final Term Summary (Lectures 23-45)   <- document title, kept as intro
 *   ## Lecture 23 — Preprocessor                     <- one section, one page
 *   ### Topics Covered                               <- stays within its section
 *
 * Splitting there turns one 186 KB document into 19 lecture-sized pages of ~10 KB,
 * each a natural reading unit and a more specific search target ("CS201 lecture 23").
 *
 * ── Contract with crash plans ──
 *
 * `slug` uses the SAME slugify() that renders heading ids, so a crash-plan study
 * block's stored `#anchor` still identifies a real heading. `anchors` lists every
 * heading slug inside a section, which is what lets the index page forward an old
 * `/handout/CODE/TERM#anchor` link to the section page that now owns it. Crash plans
 * are persisted in MongoDB, so links baked into already-saved plans must keep
 * working — do not remove that lookup.
 *
 * Pure and side-effect free, like readiness.compute.ts and crashPlan.compute.ts.
 */

export interface HandoutSection {
  /** slugify()'d heading text — the URL segment and the heading's own id. */
  slug: string;
  /** Heading text with the `##` and surrounding whitespace removed. */
  title: string;
  /** The section's markdown, including its own `##` heading line. */
  markdown: string;
  /** Slugs of EVERY heading inside this section, including its own. */
  anchors: string[];
}

export interface SplitHandout {
  /** The `# Title` line's text, if the document opens with one. */
  title: string | null;
  /** Everything before the first `##` — title, preamble, any lead-in prose. */
  intro: string;
  sections: HandoutSection[];
}

const H2 = /^##\s+(.*\S)\s*$/;
const ANY_HEADING = /^(#{1,6})\s+(.*\S)\s*$/;
const FENCE = /^\s*(`{3,}|~{3,})/;

/**
 * Walk the document line by line, tracking fenced code blocks so a `## comment`
 * inside a C++ example is never mistaken for a section boundary. Handout content
 * is full of code, so this matters.
 */
export function splitHandout(markdown: string): SplitHandout {
  const lines = (markdown ?? "").split(/\r?\n/);

  let title: string | null = null;
  const introLines: string[] = [];
  const sections: HandoutSection[] = [];

  let current: { title: string; lines: string[]; anchors: string[] } | null = null;
  let fence: string | null = null;
  const usedSlugs = new Map<string, number>();

  /** Keep slugs unique — two lectures can share a heading ("Revision"). */
  const uniqueSlug = (text: string): string => {
    const base = slugify(text) || "section";
    const seen = usedSlugs.get(base) ?? 0;
    usedSlugs.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  };

  const flush = () => {
    if (!current) return;
    sections.push({
      slug: uniqueSlug(current.title),
      title: current.title,
      markdown: current.lines.join("\n").trim(),
      anchors: current.anchors,
    });
    current = null;
  };

  for (const line of lines) {
    const fenceMatch = FENCE.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (fence === null) fence = marker;
      else if (marker.startsWith(fence[0]) && marker.length >= fence.length) {
        fence = null;
      }
      (current ? current.lines : introLines).push(line);
      continue;
    }

    // Inside a code fence nothing is a heading.
    if (fence !== null) {
      (current ? current.lines : introLines).push(line);
      continue;
    }

    const h2 = H2.exec(line);
    if (h2) {
      flush();
      current = { title: h2[1], lines: [line], anchors: [] };
      current.anchors.push(slugify(h2[1]));
      continue;
    }

    const heading = ANY_HEADING.exec(line);
    if (heading) {
      if (heading[1].length === 1 && title === null && current === null) {
        title = heading[2];
      }
      if (current) current.anchors.push(slugify(heading[2]));
    }

    (current ? current.lines : introLines).push(line);
  }
  flush();

  return {
    title,
    intro: introLines.join("\n").trim(),
    sections,
  };
}

/**
 * ── Why sections are GROUPED into pages rather than published one-per-`##` ──
 *
 * Measured across a 41-handout sample: the mean handout holds **25 `##` sections
 * averaging just 8 KB of markdown**, and the extreme (CS206 final term) holds 158
 * at ~4 KB each. One page per section would have published **~7,100 URLs**, most of
 * them ~600-1,200 words.
 *
 * That trades one problem for a worse one. This domain currently has ~111 pages
 * indexed, is already being declined on 161, and is recovering from an index
 * collapse — adding 7,000 thin URLs is the textbook thin-content-at-scale pattern,
 * and would most likely land almost all of them in "Crawled - currently not
 * indexed" while depressing site-wide quality signals.
 *
 * Grouping consecutive sections up to a byte target instead gives ~4-6 substantial
 * pages per handout (~1,200 total), each well under the mobile crawl budget and
 * each still a coherent reading unit — several consecutive lectures, which is how
 * students revise anyway. A handout already below the target is left as ONE page,
 * so short courses gain no URLs at all.
 */

/** Markdown bytes to aim for per page. ~50 KB renders to roughly 150 KB of HTML. */
export const TARGET_PAGE_BYTES = 50_000;

export interface HandoutPage {
  /** URL segment — the slug of the page's FIRST section. */
  slug: string;
  /** Human label, e.g. "Lecture 23 — Preprocessor" or a first→last range. */
  title: string;
  markdown: string;
  /** Every heading slug on this page, for legacy #anchor forwarding. */
  anchors: string[];
  /** Section titles contained here, for the index page's table of contents. */
  sectionTitles: string[];
}

/**
 * Group a split handout's sections into pages of roughly `targetBytes`.
 *
 * Returns an EMPTY array when the whole document already fits in one page — the
 * caller then renders it unsplit, exactly as before, and publishes no extra URLs.
 */
export function buildHandoutPages(
  split: SplitHandout,
  targetBytes: number = TARGET_PAGE_BYTES,
): HandoutPage[] {
  const total =
    split.intro.length +
    split.sections.reduce((sum, s) => sum + s.markdown.length, 0);
  if (total <= targetBytes || split.sections.length < 2) return [];

  const pages: HandoutPage[] = [];
  let bucket: HandoutSection[] = [];
  let bucketBytes = 0;

  const flush = () => {
    if (bucket.length === 0) return;
    const first = bucket[0];
    const last = bucket[bucket.length - 1];
    pages.push({
      slug: first.slug,
      title:
        bucket.length === 1 ? first.title : `${first.title} → ${last.title}`,
      markdown: bucket.map((s) => s.markdown).join("\n\n"),
      anchors: bucket.flatMap((s) => s.anchors),
      sectionTitles: bucket.map((s) => s.title),
    });
    bucket = [];
    bucketBytes = 0;
  };

  for (const section of split.sections) {
    // Start a new page once adding this section would overshoot — but never emit
    // an empty one, so a single oversized section still gets a page of its own.
    if (bucketBytes > 0 && bucketBytes + section.markdown.length > targetBytes) {
      flush();
    }
    bucket.push(section);
    bucketBytes += section.markdown.length;
  }
  flush();

  return pages;
}

/**
 * Which page owns a given heading anchor. Used by the index page to forward a
 * legacy `/handout/CODE/TERM#anchor` deep link — including ones baked into crash
 * plans already saved in the database — to the page that now holds it.
 */
export function pageForAnchor(
  pages: HandoutPage[],
  anchor: string,
): HandoutPage | null {
  if (!anchor) return null;
  const needle = anchor.replace(/^#/, "").toLowerCase();
  for (const page of pages) {
    if (page.anchors.some((a) => a.toLowerCase() === needle)) return page;
  }
  return null;
}

/** Compact anchor → page-slug map, small enough to inline in the index page. */
export function anchorIndex(pages: HandoutPage[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const page of pages) {
    for (const anchor of page.anchors) {
      if (!(anchor in map)) map[anchor] = page.slug;
    }
  }
  return map;
}
