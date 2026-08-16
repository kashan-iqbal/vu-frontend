// GitHub-style heading slug. MUST stay in sync with the backend copy
// (backend/src/modules/crash-plan/crashPlan.slug.ts) so a crash-plan study block's
// `#anchor` deep-link lands on the matching handout heading id.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // strip punctuation
    .replace(/[\s_]+/g, "-") // spaces/underscores → hyphen
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Extract the plain text of a React markdown heading node's children so it can be
// slugified into a stable id.
export function headingText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    (children as { props?: { children?: React.ReactNode } }).props
  ) {
    return headingText(
      (children as { props: { children?: React.ReactNode } }).props.children,
    );
  }
  return "";
}
