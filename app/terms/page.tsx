import type { Metadata } from "next";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of ExamPrep AI. ExamPrep AI is an independent study tool and is not affiliated with Virtual University (VU).",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "June 18, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 py-16">
        <div className="container max-w-3xl mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-slate max-w-none prose-headings:text-blue-900 prose-a:text-teal-600 prose-strong:text-blue-900">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of
            ExamPrep AI (the &quot;Service&quot;). By creating an account or
            using the Service, you agree to these Terms. If you do not agree,
            please do not use the Service.
          </p>

          <h2>1. Independence &amp; no affiliation</h2>
          <p>
            ExamPrep AI is an <strong>independent</strong> study and
            exam-preparation tool. We are <strong>not</strong> affiliated with,
            endorsed by, sponsored by, or officially connected to Virtual
            University (VU) or any other educational institution, examination
            body, or government entity. Any institution or course names are used
            solely to help students identify relevant study material. All such
            names and trademarks remain the property of their respective owners.
            The Service is not a source of official academic records, results,
            or accreditation.
          </p>

          <h2>2. Eligibility &amp; accounts</h2>
          <p>
            You must provide accurate information when registering and are
            responsible for keeping your account credentials secure and for all
            activity under your account.
          </p>

          <h2>3. Acceptable use</h2>
          <ul>
            <li>Do not use the Service for any unlawful purpose.</li>
            <li>
              Do not attempt to disrupt, attack, or gain unauthorised access to
              the Service or other users&apos; data.
            </li>
            <li>
              Do not misuse the Service to cheat in any examination or to violate
              your institution&apos;s rules.
            </li>
          </ul>

          <h2>4. User-contributed content</h2>
          <p>
            If you upload a course PDF or other material, you confirm that you
            have the right to share it and that doing so does not infringe any
            copyright or institutional policy. Do not upload confidential,
            copyrighted, or exam material you are not permitted to share. If you
            believe content has been shared improperly, contact us and we will
            review and remove it where appropriate.
          </p>

          <h2>5. AI-generated content</h2>
          <p>
            Parts of the Service use AI to generate explanations and study
            content. This content may be{" "}
            <strong>incomplete or inaccurate</strong> and is provided for study
            assistance only. It is not a substitute for your official course
            material, lecturers, or institution. Always verify important facts
            against authoritative sources.
          </p>

          <h2>6. No guarantee of results</h2>
          <p>
            The Service is a study aid. We do not guarantee any particular exam
            outcome, grade, or result. Your performance depends on many factors
            outside our control.
          </p>

          <h2>7. Intellectual property</h2>
          <p>
            The Service, including its design, software, and original content, is
            owned by ExamPrep AI and protected by applicable laws. You may use it
            for your personal, non-commercial study only.
          </p>

          <h2>8. Termination</h2>
          <p>
            We may suspend or terminate access if these Terms are violated. You
            may stop using the Service and request account deletion at any time.
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the Service is provided
            &quot;as is&quot; without warranties of any kind, and ExamPrep AI is
            not liable for any indirect or consequential damages arising from
            your use of the Service.
          </p>

          <h2>10. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the
            Service after changes take effect constitutes acceptance of the
            updated Terms.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about these Terms? Email us at{" "}
            <a href="mailto:support@vuexamprep.com">support@vuexamprep.com</a>.
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
}
