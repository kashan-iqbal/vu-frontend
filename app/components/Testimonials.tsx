import { Star, Quote } from "lucide-react";
import { testimonials } from "../data/testimonials";

// Server component — pure content, no client JS. The quotes add keyword-rich,
// crawlable copy to the landing page. (No Review structured data: the sample
// quotes are placeholders, not verified reviews.)
export default function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-slate-50 py-20" aria-labelledby="testimonials-heading">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-16 text-center">
          <h2
            id="testimonials-heading"
            className="mb-4 text-4xl font-bold text-blue-900"
          >
            Loved by VU Students
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            See how students use ExamPrep AI to study smarter and raise their
            exam scores.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <Quote className="mb-4 h-8 w-8 text-teal-500/70" />
              <div className="mb-4 flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="flex-grow leading-relaxed text-slate-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-slate-100 pt-4">
                <div className="font-semibold text-blue-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.detail}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
