export interface BlogPost {
  slug: string;
  title: string;
  description: string; // used for meta description + card excerpt
  date: string; // ISO
  readTime: string;
  tags: string[];
  content: string; // markdown
}

export const blogPosts: BlogPost[] = [
  {
    slug: "vu-final-term-exam-preparation-guide",
    title: "How to Prepare for Final Term Exams: A Complete Study Guide",
    description:
      "A practical, step-by-step study guide to prepare for university final term exams — build a realistic timetable, revise the right topics, and practice with MCQs to boost your score.",
    date: "2026-05-12",
    readTime: "7 min read",
    tags: ["Exam Preparation", "Study Guide", "Final Term"],
    content: `Final term exams decide a large share of your grade, yet most students start revising far too late and study the wrong things. This guide walks you through a focused plan that turns limited time into real results.

## Start with a realistic timetable

Count the days you have left and list every subject with its exam date. Give more sessions to the subjects you find hardest, not the ones you already enjoy. Short, daily sessions of 45–60 minutes beat occasional all-nighters because your brain retains more when revision is spaced out.

## Revise the right topics, not every topic

You can't re-read everything, so be strategic:

- Pull out the **course outline** and mark high-weight topics.
- Review past assessments and your own mistakes — these reveal your weak areas.
- Spend the most time where you lose the most marks.

This is exactly where practice quizzes help: when a quiz records the topics you get wrong, you get an instant, honest map of what to study next.

## Practice with MCQs, don't just read

Reading feels productive but is passive. **Active recall** — answering questions from memory — is one of the most effective study techniques proven by research. Take a quiz, check your answers, read the explanation for anything you missed, then retake a fresh set a day later.

## Use explanations to fix the gap

When you get a question wrong, the goal isn't to memorise the answer — it's to understand the concept. A short explanation of *why* the correct option is right (and why yours was wrong) converts a mistake into lasting knowledge. Tools that generate concise topic explanations for your missed questions make this loop fast.

## The week before the exam

- Switch from learning new material to **revising and testing**.
- Do at least one full practice quiz per subject under timed conditions.
- Sleep properly — memory consolidation happens while you rest.

## Final thoughts

Smart preparation beats long preparation. Build a focused timetable, target your weak topics, and practice actively with MCQs and explanations. Do that consistently and you'll walk into your final term exams prepared and calm.`,
  },
  {
    slug: "tips-to-ace-mcq-exams",
    title: "10 Proven Tips to Ace MCQ Exams",
    description:
      "Master multiple-choice exams with 10 practical tips — from reading questions carefully and eliminating wrong options to timing, active recall, and learning from every mistake.",
    date: "2026-05-28",
    readTime: "6 min read",
    tags: ["MCQ Tips", "Exam Strategy", "Study Tips"],
    content: `Multiple-choice questions look easy but are designed to catch small gaps in understanding. These ten tips will help you score higher on any MCQ exam.

## 1. Read the full question first

Don't jump to the options. Understand exactly what is being asked — especially watch for words like *not*, *except*, and *always*.

## 2. Predict the answer before looking

Try to answer in your head first, then find the matching option. This stops the distractors from misleading you.

## 3. Eliminate wrong options

Even when you're unsure, removing two clearly wrong choices doubles your odds. Cross them off mentally and focus on what remains.

## 4. Watch for absolute words

Options containing *always*, *never*, or *all* are often (not always) wrong, while balanced statements tend to be correct.

## 5. Don't overthink familiar questions

Your first instinct is usually right. Only change an answer if you have a concrete reason.

## 6. Manage your time

Quickly answer the questions you know, mark the hard ones, and return to them. Never let one question eat your whole exam.

## 7. Practice with active recall

The single best way to prepare for MCQs is to **take MCQs**. Regular practice quizzes train your brain to retrieve answers under pressure.

## 8. Learn from every mistake

After each practice quiz, review the explanation for every wrong answer. Understanding *why* you missed it is what prevents the same mistake in the real exam.

## 9. Target your weak topics

Track which topics you keep getting wrong and study those first. Adaptive quizzes that re-test your weak areas make this effortless.

## 10. Stay calm and trust your preparation

Confidence comes from practice. If you've done focused revision, trust it — anxiety causes more wrong answers than lack of knowledge.

## Bottom line

MCQ success is a skill you can train. Combine smart test-taking technique with consistent practice and honest review of your mistakes, and your scores will climb.`,
  },
  {
    slug: "how-ai-improves-exam-preparation",
    title: "How AI Is Changing Exam Preparation (and How to Use It)",
    description:
      "Discover how AI study tools help students learn faster — personalised practice, instant explanations, weak-topic detection, and smarter revision. A practical look at using AI for exam prep.",
    date: "2026-06-10",
    readTime: "6 min read",
    tags: ["AI", "Study Tools", "Exam Preparation"],
    content: `Artificial intelligence is quietly transforming how students study. Used well, AI can make revision faster, more personal, and far less overwhelming. Here's what's changing and how to make the most of it.

## From one-size-fits-all to personalised

Traditional study material treats every student the same. AI flips that: by looking at which questions you get wrong, it can focus your practice on the exact topics you struggle with — so no time is wasted on what you already know.

## Instant explanations, on demand

One of the biggest time-savers is getting a clear explanation the moment you need it. Instead of hunting through a textbook for why an answer is correct, AI can summarise the concept in a few lines tailored to the question you just missed.

## Weak-topic detection

Good AI study tools keep a quiet record of your mistakes and surface patterns you might not notice yourself — for example, that you consistently lose marks on a specific topic. That awareness is the first step to fixing it.

## Smarter, adaptive revision

Because AI knows your weak spots, it can build practice sets that mix more questions from those topics with fresh ones. Each quiz becomes a targeted revision session rather than random practice.

## How to use AI for exam prep effectively

- **Practice first, then read.** Take a quiz, then use AI explanations for what you missed.
- **Don't memorise answers — understand concepts.** Ask the explanation to clarify the *why*.
- **Verify important facts.** AI is a fast helper, not an infallible oracle; cross-check anything critical.
- **Revise consistently.** AI removes friction, but steady daily practice is still what builds memory.

## A word of caution

AI is a powerful assistant, not a replacement for understanding. Treat AI-generated explanations as a starting point, confirm anything you're unsure about, and keep your own thinking in the driver's seat.

## The takeaway

AI won't pass the exam for you — but used wisely, it helps you study the right things, understand them faster, and walk in better prepared. That's a real edge, and it's available today.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
