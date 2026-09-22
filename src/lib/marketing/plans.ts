import { cache } from "react";
import { getPricingPlans, PRICING_GROUPS } from "@/lib/pricing";
import { tidy, type Group, type GroupKey } from "@/lib/marketing/plan-display";

/**
 * Server side of the public site's pricing. Every figure comes from
 * getPricingPlans(): the PricingPlan table owners edit in CRM settings, with
 * DEFAULT_PLANS as the fallback. Nothing here is a second source of truth.
 */

/** One database read per request, however many sections ask. */
export const loadPlans = cache(getPricingPlans);

// Group keys and labels are the CRM's; the site only re-punctuates one blurb.
const BLURBS: Partial<Record<GroupKey, string>> = {
  receptionist:
    "A voice agent that answers, qualifies, and books, so the phone stops costing you jobs. Every plan includes monitoring, routine tuning, call-routing improvements, and business-day support.",
};

export const GROUPS: Group[] = PRICING_GROUPS.map((g) => ({
  key: g.key as GroupKey,
  label: g.label,
  blurb: BLURBS[g.key as GroupKey] ?? tidy(g.blurb),
}));
