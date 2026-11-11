import type { CaseStudyData } from "@/components/marketing/templates/case-study-page";
import { WORK, type Work } from "@/lib/marketing/work";

/**
 * Case studies for the client sites in work.ts. Only what we know: who the
 * client is, where, what we built, and the live link. PageSpeed scores go in
 * only once measured (with the date), and quotes only with the client's
 * written permission.
 */
const client = (slug: string): Work => {
  const w = WORK.find((x) => x.slug === slug);
  if (!w) throw new Error(`No client "${slug}" in work.ts`);
  return w;
};

export const CASE_STUDIES: CaseStudyData[] = [
  {
    slug: "elite-real-estate-partners",
    path: "/work/elite-real-estate-partners",
    work: client("elite"),
    industryLabel: "Real estate brokerage",
    title: "Elite Real Estate Partners Website | ArkiTech Case Study",
    description:
      "How ArkiTech Solutions designed and built the website for Elite Real Estate Partners, a Vermont real estate brokerage, with a link to the live site.",
    kicker: "Case study · Real estate",
    h1: "Elite Real Estate Partners: a website for a Vermont real estate brokerage",
    quickAnswer:
      "ArkiTech Solutions designed and built the website for Elite Real Estate Partners, a real estate brokerage working across Vermont. The site is live at elitehomesvermont.com. This page covers who the client is, what we built, and how to check the site's speed on a phone yourself.",
    sections: [
      {
        h2: "Who is Elite Real Estate Partners?",
        blocks: [
          { p: "Elite Real Estate Partners is a real estate brokerage that works across Vermont, border to border." },
          { todo: "add a sentence about the brokerage in the client's own words (agents, towns, specialties)." },
        ],
      },
      {
        h2: "What did we build?",
        blocks: [
          { p: "A custom website, designed and built by us, for buyers and sellers looking for an agent in Vermont." },
          { todo: "list what the site includes (pages, listings or IDX search, contact and lead forms) and anything we run for them now." },
        ],
      },
    ],
    related: [
      { href: "/industries/real-estate", label: "Websites for real estate agents and brokerages" },
      { href: "/services/websites", label: "Custom website design" },
      { href: "/work", label: "All client work" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
];
