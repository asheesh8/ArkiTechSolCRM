import type { ComparePageData } from "@/components/marketing/templates/compare-page";

/**
 * Comparison pages. Factual only: state what each option or provider
 * publishes, link a source for every claim about someone else, give the date
 * it was checked, and never disparage anyone. Drafts until written.
 */
const draft = (slug: string, h1: string, title: string, description: string, questions: string[]): ComparePageData => ({
  slug,
  path: `/compare/${slug}`,
  title,
  description,
  kicker: "Comparison",
  h1,
  quickAnswer: `This comparison will set the options side by side with sources for every claim about other providers. It's still being written.`,
  sections: questions.map((h2) => ({ h2, blocks: [{ todo: "write this section, citing each provider's own published page with the date checked." }] })),
  related: [{ href: "/pricing", label: "Plans and pricing" }],
  published: "2026-11-11",
  updated: "2026-11-11",
  noindex: true,
});

export const COMPARISONS: ComparePageData[] = [
  draft(
    "website-builder-vs-custom-website",
    "Website builder vs custom website: which is right for a small business?",
    "Website Builder vs Custom Website for Small Firms | ArkiTech",
    "Website builders are cheap to start; custom websites are built around your business. A plain comparison of cost, speed, ownership and upkeep for small firms.",
    ["What does a website builder cost over a year?", "What does a custom website cost?", "Which is faster on a phone?", "Who owns the site?", "Which should I choose?"],
  ),
];
