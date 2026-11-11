import type { IndustryPageData } from "@/components/marketing/templates/industry-page";

/**
 * Industry pages. Drafts until each has content specific to that industry
 * (how its customers search, what its site has to do, real clients in it).
 * Drafts are served noindex, left out of the sitemap, and not linked from
 * published pages.
 */
const draft = (
  slug: IndustryPageData["industry"],
  audience: string,
  h1: string,
  title: string,
  description: string,
  questions: string[],
): IndustryPageData => ({
  slug,
  industry: slug,
  audience,
  path: `/industries/${slug}`,
  title,
  description,
  kicker: "Industry guide",
  h1,
  quickAnswer: `This guide will cover what a website for ${audience} needs to do: how their customers search, what the site has to show, and which ArkiTech plan fits. It's still being written.`,
  sections: questions.map((h2) => ({ h2, blocks: [{ todo: `write the answer for ${audience}, with real examples.` }] })),
  related: [
    { href: "/pricing", label: "Plans and pricing" },
    { href: "/work", label: "Client work" },
  ],
  published: "2026-11-11",
  updated: "2026-11-11",
  noindex: true,
});

export const INDUSTRIES: IndustryPageData[] = [
  draft(
    "landscapers",
    "landscapers",
    "Websites for landscaping companies in Vermont",
    "Websites for Landscaping Companies in Vermont | ArkiTech",
    "What a landscaping company's website needs to do in Vermont: show real job photos, take quote requests, and keep Google reviews coming in every season.",
    ["How do people find a landscaper?", "What should a landscaping website show?", "How do reviews help a landscaping business?", "Which plan fits a landscaping company?"],
  ),
];
