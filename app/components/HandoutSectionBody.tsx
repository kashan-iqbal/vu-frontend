"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { NoCopy } from "@/components/NoCopy";
import { slugify, headingText } from "@/lib/slug";

/**
 * Renders ONE page of a split handout.
 *
 * Deliberately not HandoutClient: that component owns a React Query entry keyed on
 * (code, examType) and would refetch the WHOLE handout, which is exactly the weight
 * the split exists to avoid. Section markdown is already server-rendered into the
 * HTML, and a section never changes independently of its handout, so there is
 * nothing here worth re-fetching on the client.
 *
 * Heading levels are demoted one step, matching HandoutClient: the page supplies the
 * single <h1>, so a handout's own `##` becomes an <h3> here. Ids still come from
 * slugify(), so crash-plan deep links resolve against the same anchors.
 */

const heading = (Tag: "h2" | "h3" | "h4" | "h5") => {
  const H = ({ children, ...props }: ComponentPropsWithoutRef<typeof Tag>) => (
    <Tag id={slugify(headingText(children))} className="scroll-mt-24" {...props}>
      {children}
    </Tag>
  );
  H.displayName = `Section${Tag}`;
  return H;
};

const markdownComponents = {
  h1: heading("h2"),
  h2: heading("h3"),
  h3: heading("h4"),
  h4: heading("h5"),
};

export default function HandoutSectionBody({
  markdown,
}: {
  markdown: string;
}) {
  return (
    <NoCopy className="bg-white">
      <div className="mx-auto max-w-3xl px-4">
        <article className="prose prose-slate max-w-none prose-headings:text-blue-900 prose-a:text-teal-600">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </div>
    </NoCopy>
  );
}
