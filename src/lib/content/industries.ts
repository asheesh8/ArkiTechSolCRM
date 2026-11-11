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
  draft(
    "cleaning-companies",
    "cleaning companies",
    "Websites for cleaning companies in Vermont",
    "Websites for Cleaning Companies in Vermont | ArkiTech",
    "What a cleaning company's website needs in Vermont: clear services and areas, an easy estimate request, and reviews that show customers they can trust you.",
    ["How do customers choose a cleaning company?", "What should a cleaning company's website include?", "How do estimate requests reach you?", "Which plan fits a cleaning company?"],
  ),
  draft(
    "real-estate",
    "real estate agents and brokerages",
    "Websites for real estate agents and brokerages in Vermont",
    "Real Estate Agent & Brokerage Websites in Vermont | ArkiTech",
    "What a Vermont real estate website needs: agent pages, listings search, fast pages on phones, and lead capture that reaches the right agent the same day.",
    ["What do home buyers and sellers look for on an agent's site?", "How do listings get onto the site?", "How do leads reach the right agent?", "Which plan fits a brokerage?"],
  ),
  draft(
    "restaurants",
    "restaurants",
    "Websites for restaurants in Vermont",
    "Restaurant Website Design in Vermont | ArkiTech Solutions",
    "What a Vermont restaurant's website needs: the menu and hours up front, fast on a phone, Google profile hours that match, and reviews that bring diners in.",
    ["What do diners look for first?", "Should the menu be a PDF or a page?", "How do hours stay right on Google and the site?", "Which plan fits a restaurant?"],
  ),
  draft(
    "contractors",
    "contractors",
    "Websites for contractors in Vermont",
    "Websites for Contractors and Builders in Vermont | ArkiTech",
    "What a contractor's website needs in Vermont: real project photos, the towns you work in, a quote request that reaches you, and reviews that win the job.",
    ["How do homeowners find a contractor?", "What should a contractor's site show?", "How do quote requests reach you?", "Which plan fits a contractor?"],
  ),
  draft(
    "nonprofits",
    "nonprofits",
    "Websites for nonprofits in Vermont",
    "Nonprofit Website Design in Vermont | ArkiTech Solutions",
    "What a Vermont nonprofit's website needs: a clear mission, ways to donate or volunteer that work on a phone, and pages funders and supporters can find.",
    ["What should a nonprofit website do first?", "How do donations and sign-ups work?", "How do supporters and funders find you?", "Which plan fits a nonprofit?"],
  ),
];
