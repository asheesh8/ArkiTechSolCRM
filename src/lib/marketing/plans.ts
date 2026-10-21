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

export const GROUPS: Group[] = PRICING_GROUPS.map((g) => ({
  key: g.key as GroupKey,
  label: g.label,
  blurb: tidy(g.blurb),
}));
