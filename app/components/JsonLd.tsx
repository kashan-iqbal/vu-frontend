/**
 * Renders a JSON-LD <script> for structured data. Server component (no client
 * JS shipped). Content is serialized safely; only trusted, app-controlled
 * objects should be passed in.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is escaped for the two characters that can break
      // out of a <script> context.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
