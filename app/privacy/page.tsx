import type { Metadata } from "next";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | ExamPrep AI",
  description:
    "How ExamPrep AI collects, uses, and protects your data. ExamPrep AI is an independent study tool and is not affiliated with Virtual University (VU).",
};

const LAST_UPDATED = "June 18, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 py-16">
        <div className="container max-w-3xl mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-slate max-w-none prose-headings:text-blue-900 prose-a:text-teal-600 prose-strong:text-blue-900">
          <p>
            This Privacy Policy explains how ExamPrep AI (&quot;we&quot;,
            &quot;us&quot;) handles information when you use our website and
            study tools (the &quot;Service&quot;). Please read it alongside our{" "}
            <a href="/terms">Terms of Service</a>.
          </p>

          <p>
            <strong>Independence notice.</strong> ExamPrep AI is an independent
            exam-preparation tool. We are <strong>not</strong> affiliated with,
            endorsed by, sponsored by, or officially connected to Virtual
            University (VU) or any other educational institution. All
            institution names and trademarks belong to their respective owners
            and are used, if at all, only for identification.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Account information</strong> you provide when signing up —
              such as your name, email address, and phone number.
            </li>
            <li>
              <strong>Usage and study data</strong> — quiz attempts, the topics
              of questions you answer incorrectly, and similar progress data
              used to personalise your practice.
            </li>
            <li>
              <strong>Uploaded files</strong> — if you choose to contribute a
              course PDF, the file is emailed to our team for review and is{" "}
              <strong>not stored</strong> on the Service.
            </li>
            <li>
              <strong>Essential cookies</strong> — we use a secure, HTTP-only
              authentication cookie to keep you signed in. We do not use it to
              track you across other websites.
            </li>
          </ul>

          <h2>How we use your information</h2>
          <ul>
            <li>To provide and operate the Service and your account.</li>
            <li>
              To personalise your quizzes and generate explanations for the
              topics you miss.
            </li>
            <li>To respond to your messages and support requests.</li>
            <li>To maintain the security and integrity of the Service.</li>
          </ul>

          <h2>Service providers</h2>
          <p>
            We rely on a small number of third-party providers to run the
            Service, including an email delivery provider, a cloud/database host,
            and an AI provider that generates topic explanations from quiz data.
            These providers process information only as needed to provide their
            service.
          </p>

          <h2>Data retention</h2>
          <p>
            We keep account and study data while your account is active. You may
            request deletion of your account and associated data at any time by
            contacting us.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>Access, correct, or delete your account information.</li>
            <li>Request a copy of the data associated with your account.</li>
            <li>Stop using the Service at any time.</li>
          </ul>

          <h2>Children</h2>
          <p>
            The Service is intended for university-level students and is not
            directed at children under 13. We do not knowingly collect data from
            them.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be
            reflected by updating the &quot;Last updated&quot; date above.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy? Email us at{" "}
            <a href="mailto:support@vuexamprep.com">support@vuexamprep.com</a>.
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
}
