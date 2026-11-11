/**
 * Terms that go with each plan but aren't stored in the pricing table: the
 * contract length, whether it can be cancelled, what isn't included, and who
 * owns or hosts the result. The pricing page, service pages, FAQ and the Offer
 * schema all read these, keyed by plan slug, so the wording stays in step.
 * Prices themselves stay in the pricing table (src/lib/pricing.ts).
 */
export type OfferTerms = {
  /** Fixed contract length, in months. */
  termMonths?: number;
  cancelAnytime?: boolean;
  notIncluded?: string[];
  hosting?: string;
  ownership?: string;
};

export const OFFER_TERMS: Record<string, OfferTerms> = {
  "growth-partnership": {
    termMonths: 12,
  },
  "custom-website": {
    cancelAnytime: true,
    notIncluded: ["Google Business Profile management", "Review requests and review replies"],
    hosting: "No requirement to host with us.",
  },
  "ai-search": {
    ownership: "After the build, pick a hosting plan or own the site outright.",
  },
};

/** The plan slugs each service page offers, in the order its Offer schema lists them. */
export const SERVICE_OFFERS: Record<string, string[]> = {
  websites: ["custom-website", "growth-partnership"],
  "ai-search": ["ai-search"],
  dashboards: ["dashboard-analytics", "dashboard-finance", "dashboard-ai-assistant", "dashboard-scheduling"],
};
