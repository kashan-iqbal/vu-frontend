"use client";

import type { ReactNode, SyntheticEvent } from "react";

/**
 * Discourages casual copying of course content: blocks text selection,
 * copy/cut (incl. select-all + Ctrl+C), right-click → Copy, and drag-to-copy.
 *
 * Deterrent only — NOT protection. The content is still delivered to the
 * browser, so it remains readable via devtools, "view source", reader mode,
 * disabling JavaScript, or by calling the API directly. This only stops the
 * low-effort path.
 *
 * Form fields keep normal selection so typing and editing still work.
 */
export function NoCopy({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const block = (e: SyntheticEvent) => e.preventDefault();

  return (
    <div
      onCopy={block}
      onCut={block}
      onContextMenu={block}
      onDragStart={block}
      className={`select-none [&_input]:select-text [&_textarea]:select-text ${className}`}
    >
      {children}
    </div>
  );
}
