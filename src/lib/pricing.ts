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
      "Three ways to work with us: a year-long growth partnership, a custom website on its own, or a build for AI search.",
  },
  {
    key: "addons",
    label: "Dashboard add-ons",
    blurb:
      "The Overview and CRM dashboards come with the Growth Partnership and with the Custom Website's monthly plan. Add any of these on top.",
  },
] as const;

export const DEFAULT_PLANS: PricingPlan[] = [
  // ------------------------------------------------------------------- Plans
  {
    slug: "growth-partnership",
    group: "plans",
    name: "Growth Partnership",
    blurb:
      "A year-long partnership. We build your website, manage your Google Business Profile, and send 30 review requests a month.",
    monthlyCents: 30000,
    onceCents: null,
    priceNote: "12-month partnership",
    features: [
      "Your website, designed and built by us",
      "Google Business Profile management",
      "30 review requests a month",
      "Overview and CRM dashboards included",
      "Analytics, Finance, AI Assistant and Scheduling: $50/month each",
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
      "A custom website for a one-time fee. Google Business Profile management and review requests are not included.",
    monthlyCents: 15000,
    onceCents: 100000,
    priceNote: "Monthly plan optional, cancel anytime",
    features: [
      "Custom website design and build",
      "Optional $150/month plan, cancel anytime",
      "Monthly plan includes the Overview and CRM dashboards",
      "More dashboards: $50/month each, on the monthly plan",
    ],
    featured: false,
    active: true,
    sortOrder: 20,
  },
  {
    slug: "ai-search",
    group: "plans",
    name: "AI Search Optimization",
    blurb:
      "200 unique, keyword-driven pages that help your business get recommended by ChatGPT, Claude and other AI answer engines.",
    monthlyCents: null,
    onceCents: 300000,
    priceNote: null,
    features: [
      "200 unique keyword-driven pages",
      "Written to be recommended by AI answer engines",
      "One-time build",
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
    monthlyCents: 5000,
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
    monthlyCents: 5000,
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
    monthlyCents: 5000,
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
    monthlyCents: 5000,
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
