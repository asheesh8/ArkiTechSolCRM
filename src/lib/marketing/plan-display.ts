import type { PricingPlan } from "@/lib/pricing";

/**
 * Display helpers for pricing that are safe in client components. Nothing in
 * here imports @/lib/pricing at runtime (it pulls in Prisma); the plans
 * themselves arrive as props from server components that call loadPlans().
 */

export type Plan = PricingPlan;
export type GroupKey = "websites" | "receptionist" | "systems" | "growth" | "advisory";
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

export function cheapest(plans: Plan[], key: "monthlyCents" | "onceCents") {
  return plans
    .filter((p) => p[key] != null)
    .sort((a, b) => (a[key] as number) - (b[key] as number))[0];
}

export function planNamed(plans: Plan[], name: string) {
  return plans.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

/** The "from" line a service quotes, derived from whatever plans are live. */
export function startingPrice(serviceSlug: string, plans: Plan[]): { lead: string; amount?: string; tail?: string } {
  switch (serviceSlug) {
    case "websites": {
      const p = cheapest(plansIn(plans, "websites"), "monthlyCents");
      return p ? { lead: "From", amount: money(p.monthlyCents!), tail: "a month" } : { lead: "See pricing" };
    }
    case "ai-receptionist": {
      const group = plansIn(plans, "receptionist");
      const p = cheapest(group, "onceCents") ?? cheapest(group, "monthlyCents");
      if (!p) return { lead: "See pricing" };
      if (p.onceCents != null && p.monthlyCents != null) {
        return { lead: "From", amount: money(p.onceCents), tail: `then ${money(p.monthlyCents)} a month` };
      }
      return { lead: "From", amount: money((p.onceCents ?? p.monthlyCents)!), tail: p.monthlyCents != null ? "a month" : "one time" };
    }
    case "brand-seo": {
      const p = cheapest(plansIn(plans, "growth"), "onceCents");
      return p ? { lead: p.name, amount: money(p.onceCents!), tail: "one time" } : { lead: "See pricing" };
    }
    default:
      return { lead: "Built to scope, quoted in writing" };
  }
}
