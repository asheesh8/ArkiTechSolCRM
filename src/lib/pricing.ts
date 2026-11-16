import { prisma } from "@/lib/prisma";

/**
 * Pricing for the public site.
 *
 * The numbers live in the PricingPlan table so owners can change them in CRM
 * settings without a deploy. DEFAULT_PLANS below is the seed and the fallback:
 * it is what the site shows before anybody has touched settings, and what it
 * falls back to if the database is unreachable. A pricing page that 500s
 * because Postgres hiccuped is worse than one showing a slightly stale price.
 *
 * Money is in cents everywhere. Format with `formatMoney`.
 */

export type PricingPlan = {
  slug: string;
  group: string;
  name: string;
  blurb: string;
  monthlyCents: number | null;
  onceCents: number | null;
  priceNote: string | null;
  features: string[];
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export const PRICING_GROUPS = [
  {
    key: "plans",
    label: "Plans",
    blurb:
      "Three plans: a 12-month Growth Partnership, a custom website on its own, or an AEO & GEO website build.",
  },
  {
    key: "addons",
    label: "Dashboard add-ons",
    // Every dashboard is listed without a price, by the owner's decision (2026-11-11).
    blurb:
      "The Overview and CRM dashboards come with the monthly plans. Add any of these to either website plan when you need them.",
  },
] as const;

export const DEFAULT_PLANS: PricingPlan[] = [
  // ------------------------------------------------------------------- Plans
  {
    slug: "growth-partnership",
    group: "plans",
    name: "Growth Partnership",
    blurb:
      "A 12-month partnership: we build your website, keep it fast, make your edits, and manage your Google Business Profile and reviews.",
    monthlyCents: 30000,
    onceCents: null,
    priceNote: "12-month contract",
    features: [
      "Custom website, designed and built by us",
      "PageSpeed 90+ mobile guarantee, so the site is fast on phones",
      "Unlimited edits",
      "Google Business Profile management",
      "Replies to your Google reviews",
      "30 review requests a month",
      // TODO(owner): confirm the Overview and CRM dashboards are still included.
      "Overview and CRM dashboards included",
    ],
    featured: true,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "custom-website",
    group: "plans",
    name: "Custom Website",
    blurb:
      "A custom website for a $1,000 build, with a $150/month plan you can cancel anytime. You don't have to host with us.",
    monthlyCents: 15000,
    onceCents: 100000,
    // TODO(owner): confirm whether the $150/month plan is optional or required. The site has said optional.
    priceNote: "Monthly plan optional, cancel anytime",
    features: [
      "Custom website design and build",
      "$150/month plan, cancel anytime",
      "Monthly plan includes the Overview and CRM dashboards",
      "More dashboards available when you need them",
      "No requirement to host with us",
    ],
    featured: false,
    active: true,
    sortOrder: 20,
  },
  {
    slug: "ai-search",
    group: "plans",
    name: "AEO & GEO Website Build",
    blurb:
      "Up to 200 unique, value-packed pages built to be found and cited by answer engines like ChatGPT, Perplexity, Google AI Overviews, Gemini and Claude.",
    monthlyCents: null,
    onceCents: 300000,
    priceNote: null,
    features: [
      "Up to 200 unique, value-packed pages",
      "Built to be found and cited by AI answer engines",
      // TODO(owner): define what "kept optimized" includes and for how long.
      "Kept optimized after launch",
      "Then pick a hosting plan, or own it outright",
    ],
    featured: false,
    active: true,
    sortOrder: 30,
  },

  // ---------------------------------------------------------- Dashboard add-ons
  {
    slug: "dashboard-analytics",
    group: "addons",
    name: "Analytics",
    blurb: "Google Analytics, Meta and your other social accounts, connected in one view.",
    monthlyCents: null,
    onceCents: null,
    priceNote: null,
    features: [],
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "dashboard-finance",
    group: "addons",
    name: "Finance",
    blurb: "Quote generation, and the money coming in and going out.",
    monthlyCents: null,
    onceCents: null,
    priceNote: null,
    features: [],
    featured: false,
    active: true,
    sortOrder: 20,
  },
  {
    slug: "dashboard-ai-assistant",
    group: "addons",
    name: "AI Assistant",
    blurb: "Reads all your centralized data and gives you clear answers about your business.",
    monthlyCents: null,
    onceCents: null,
    priceNote: null,
    features: [],
    featured: false,
    active: true,
    sortOrder: 30,
  },
  {
    slug: "dashboard-scheduling",
    group: "addons",
    name: "Scheduling",
    blurb: "Every calendar you use, synced into one.",
    monthlyCents: null,
    onceCents: null,
    priceNote: null,
    features: [],
    featured: false,
    active: true,
    sortOrder: 40,
  },
];

/**
 * Whether saved rows belong to the current offer lineup. The table can still
 * hold an older lineup (websites, receptionist, systems, growth, advisory
 * tabs); showing it would put retired offers back on the site, so until an
 * owner saves the new plans from settings the defaults win.
 */
export function isCurrentLineup(plans: { group: string }[]) {
  const groups: readonly string[] = PRICING_GROUPS.map((g) => g.key);
  return plans.length > 0 && plans.every((p) => groups.includes(p.group));
}

export function formatMoney(cents: number) {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // Keep whole prices clean ($195, not $195.00) but never hide real cents.
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Active plans, database first.
 *
 * Falls back to DEFAULT_PLANS when the table is empty (nobody has saved
 * settings yet) or unreachable (no DATABASE_URL during a build, Postgres
 * down). Both are normal states, so neither throws.
 */
export async function getPricingPlans(): Promise<PricingPlan[]> {
  try {
    const rows = await prisma.pricingPlan.findMany({
      where: { active: true },
      orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
    });
    if (rows.length === 0) return DEFAULT_PLANS;
    const plans = rows.map((row) => ({
      slug: row.slug,
      group: row.group,
      name: row.name,
      blurb: row.blurb,
      monthlyCents: row.monthlyCents,
      onceCents: row.onceCents,
      priceNote: row.priceNote,
      features: row.features,
      featured: row.featured,
      active: row.active,
      sortOrder: row.sortOrder,
    }));

    if (!isCurrentLineup(plans)) return DEFAULT_PLANS;

    return plans;
  } catch {
    return DEFAULT_PLANS;
  }
}
