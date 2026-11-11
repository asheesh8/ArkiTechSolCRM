import type { ContentPage } from "@/lib/content/types";

/** /guides: general guides that aren't about AEO/GEO or local SEO. Drafts until written. */
export const GUIDES: ContentPage[] = [
  {
    slug: "website-cost-vermont",
    path: "/guides/website-cost-vermont",
    title: "How Much Does a Website Cost in Vermont in 2026? | ArkiTech",
    description:
      "What a small business website costs in Vermont: one-time builds, monthly plans, and what drives the price. With ArkiTech's own published prices for reference.",
    kicker: "Guide",
    h1: "How much does a website cost in Vermont?",
    quickAnswer:
      "This guide will lay out what a small business website costs in Vermont, one-time builds against monthly plans, with ArkiTech's own published prices for reference. It's still being written.",
    sections: [
      "What does a one-time website build cost?",
      "What do monthly website plans cost?",
      "What drives the price up or down?",
      "What does ArkiTech charge?",
    ].map((h2) => ({ h2, blocks: [{ todo: "write this section; cite a source for any market price you quote." }] })),
    related: [{ href: "/pricing", label: "ArkiTech plans and pricing" }],
    published: "2026-11-11",
    updated: "2026-11-11",
    noindex: true,
  },
];
