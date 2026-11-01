import Link from "next/link";
import { Logo } from "./Logo";

// "Courses" MUST point at /courses (public, indexable), not /course (singular) —
// that one is behind AuthGuard, carries robots:noindex from its route group and is
// Disallow-ed in robots.txt, so linking to it leaked crawl budget into a dead end
// and gave the content surface no indexable hub.
const LINKS = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "All VU courses", href: "/courses" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo className="w-8 h-8" />
              <span className="font-bold text-white">ExamPrep AI</span>
            </div>
            <p className="text-sm">
              Intelligent exam preparation platform for university students.
            </p>
          </div>

          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="font-semibold text-white mb-4">{heading}</h4>
              <ul className="space-y-2 text-sm">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} ExamPrep AI. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            ExamPrep AI is an independent study tool and is not affiliated with,
            endorsed by, or connected to Virtual University (VU) or any official
            institution.
          </p>
        </div>
      </div>
    </footer>
  );
}
