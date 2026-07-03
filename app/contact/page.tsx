import type { Metadata } from "next";
import { Mail, Clock, MessageSquare } from "lucide-react";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the ExamPrep AI team. Questions, feedback, or course requests — we'd love to hear from you.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 py-20">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Get in touch
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Have a question, found a bug, or want a course added? Send us a
            message — we read every one.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto grid max-w-5xl gap-10 px-4 md:grid-cols-2">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-100">
                <Mail className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Email us</h3>
                <a
                  href="mailto:support@vuexamprep.com"
                  className="text-sm text-slate-600 hover:text-teal-600"
                >
                  support@vuexamprep.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-100">
                <Clock className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Response time</h3>
                <p className="text-sm text-slate-600">
                  We usually reply within 1–2 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-100">
                <MessageSquare className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Feedback welcome</h3>
                <p className="text-sm text-slate-600">
                  Suggestions and course requests help shape ExamPrep AI.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
