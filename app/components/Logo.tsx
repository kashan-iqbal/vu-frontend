/**
 * ExamPrep AI primary logo mark — the "Correct" app badge: a navy rounded
 * square holding a graduation cap and an MCQ checkmark, in the brand
 * blue (#1e3a8a) + teal (#2dd4bf) palette. Original mark; intentionally
 * distinct from Virtual University's logo (independent, not affiliated).
 *
 * Renders as a self-contained SVG so it looks identical on light or dark
 * surfaces (header, footer, etc.). Size it with `className`.
 */
export function Logo({
  className = "h-8 w-8",
  title = "ExamPrep AI",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
    >
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#1e3a8a" />
      <path d="M32 16 L47 22 L32 28 L17 22 Z" fill="#ffffff" />
      <path
        d="M26 26 L26 30 Q32 32.5 38 30 L38 26"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M47 22 L47 29"
        stroke="#2dd4bf"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="47" cy="30.5" r="1.9" fill="#2dd4bf" />
      <path
        d="M22 41 L29 48 L44 34"
        fill="none"
        stroke="#2dd4bf"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
