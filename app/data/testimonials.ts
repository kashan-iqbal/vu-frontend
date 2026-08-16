// ⚠️ PLACEHOLDER TESTIMONIALS — replace with REAL student quotes before launch.
//
// These are sample copy so the section renders. Do NOT present fabricated quotes
// as genuine, and do NOT add Review/AggregateRating structured data for made-up
// reviews — Google penalises self-serving fake review markup, and it's
// misleading to users. Once you have real, permission-given testimonials, swap
// them in here (and only then consider adding Review schema).

export interface Testimonial {
  quote: string;
  name: string;
  detail: string; // e.g. course / semester — keep it generic, no real identities
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "The AI explanations for the topics I kept getting wrong finally made them click. My MCQ scores jumped in two weeks.",
    name: "Sample Student",
    detail: "CS Student, Virtual University",
  },
  {
    quote:
      "Solving past MCQs with instant feedback is so much better than re-reading handouts. I actually know what I don't know now.",
    name: "Sample Student",
    detail: "MGT Student, Virtual University",
  },
  {
    quote:
      "Being able to listen to the topic reviews while commuting is a game changer for revision on the go.",
    name: "Sample Student",
    detail: "BIO Student, Virtual University",
  },
];
