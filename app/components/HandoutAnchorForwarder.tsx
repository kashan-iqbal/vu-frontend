"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Forwards a legacy `#anchor` deep link to the handout part that now owns it.
 *
 * Crash-plan study blocks carry `{ url: "/handout/CODE/TERM", anchor: "<slug>" }`,
 * and **crash plans are persisted in MongoDB** — so plans saved before the handout
 * split still point at the index page with a hash for a heading that now lives on a
 * part page. A fragment is never sent to the server, so this has to run in the
 * browser.
 *
 * `replace`, not `push`, so the back button returns the reader to wherever they came
 * from rather than bouncing them through the index page.
 *
 * The map is anchor → part slug, built at render time from the same slugify() that
 * generates heading ids. If an anchor is not in it, nothing happens and the hash is
 * left alone — the heading may genuinely be on this page (short, unsplit handouts
 * render in full).
 */
export default function HandoutAnchorForwarder({
  basePath,
  anchorMap,
}: {
  basePath: string;
  anchorMap: Record<string, string>;
}) {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "").toLowerCase();
    if (!hash) return;

    const target = anchorMap[hash];
    if (!target) return;

    router.replace(`${basePath}/${target}#${hash}`);
  }, [basePath, anchorMap, router]);

  return null;
}
