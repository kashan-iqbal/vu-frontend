import type { Metadata } from "next";
import GdbHelpClient from "@/components/GdbHelpClient";

// Personalised, credit-metered tool — keep it out of search indexes (the (other)
// layout already sets noindex, restated here for clarity).
export const metadata: Metadata = {
  title: "GDB & Assignment Help",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <GdbHelpClient />;
}
