import type { PricingPlan } from "@/lib/pricing";

/**
 * Display helpers for pricing that are safe in client components. Nothing in
 * here imports @/lib/pricing at runtime (it pulls in Prisma); the plans
 * themselves arrive as props from server components that call loadPlans().
 */

export type Plan = PricingPlan;
export type GroupKey = "plans" | "addons";
export type Group = { key: GroupKey; label: string; blurb: string };

/** Same output as formatMoney in @/lib/pricing: $195, never $195.00, real cents kept. */
export function money(cents: number) {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Owner-entered copy can carry dashes; the site sets them as a colon, which
 * reads right in every row we have ("PageSpeed guarantee: 90+ or we fix it
 * free", "Regulatory compliance: catch any violations").
 */
export function tidy(text: string) {
  return text.replace(/\s+[—–]\s+/g, ": ").replace(/[—–]/g, "-");
}

export function plansIn(plans: Plan[], group: GroupKey) {
  return plans.filter((p) => p.group === group && p.active !== false);
}

/** Which plan each service page quotes and shows first. */
export const SERVICE_PLAN: Record<string, string> = {
  websites: "custom-website",
  "ai-search": "ai-search",
  dashboards: "dashboard-analytics",
};

export function planFor(serviceSlug: string, plans: Plan[]) {
  const slug = SERVICE_PLAN[serviceSlug];
  return plans.find((p) => p.slug === slug && p.active !== false);
}

/** The "from" line a service quotes, derived from whatever plans are live. */
export function startingPrice(serviceSlug: string, plans: Plan[]): { lead: string; amount?: string; tail?: string } {
  const p = planFor(serviceSlug, plans);
  if (!p) return { lead: "See pricing" };
  if (p.group === "addons" && p.monthlyCents != null) {
    return { lead: "Overview and CRM included, add-ons", amount: money(p.monthlyCents), tail: "a month each" };
  }
  if (p.onceCents != null) {
    return { lead: "", amount: money(p.onceCents), tail: p.monthlyCents != null ? "one time, monthly plan optional" : "one time" };
  }
  if (p.monthlyCents != null) return { lead: "", amount: money(p.monthlyCents), tail: "a month" };
  return { lead: p.priceNote ? tidy(p.priceNote) : "See pricing" };
}
