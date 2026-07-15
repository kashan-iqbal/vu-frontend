import type { Metadata } from "next";
import ContributeClient from "../components/ContributeClient";

// Public and indexable: this page lives outside the (other) group precisely so
// it carries neither the AuthGuard nor that group's robots:noindex — anyone can
// contribute a PDF without an account.
export const metadata: Metadata = {
  title: "Contribute Course PDFs — Help Fellow VU Students",
  description:
    "Share the handout or notes PDF for a Virtual University course and help other students prepare. No account needed — just add your name, mobile number and the PDF.",
  alternates: { canonical: "/contribute" },
};

export default function Page() {
  return <ContributeClient />;
}
