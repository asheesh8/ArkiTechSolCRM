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
    key: "websites",
    label: "Websites",
    blurb:
      "A build fee to get the site made, then a care plan if you want it looked after. Every managed site is tested through Google PageSpeed Insights before launch and after any change we make.",
  },
  {
    key: "receptionist",
    label: "AI Receptionist",
    blurb:
      "A voice agent that answers, qualifies, and books — so the phone stops costing you jobs. Every plan includes monitoring, routine tuning, call-routing improvements, and business-day support.",
  },
  {
    key: "systems",
    label: "Systems & Automation",
    blurb:
      "Scoped work. The range depends on how many tools have to talk to each other and how much of your process is bespoke.",
  },
  {
    key: "growth",
    label: "Brand, Local SEO & Growth",
    blurb:
      "Being findable and being credible, measured rather than asserted. Ad spend is billed separately and is not included in management fees.",
  },
  {
    key: "advisory",
    label: "Advisory",
    blurb:
      "Work out what is worth building before anything gets built. Start with the free consultation.",
  },
] as const;

export const DEFAULT_PLANS: PricingPlan[] = [
  // ---------------------------------------------------------------- Websites
  {
    slug: "website-build",
    group: "websites",
    name: "Standard Website Build",
    blurb: "A custom, mobile-first website for a straightforward business site. One build fee, then it is yours.",
    monthlyCents: null,
    onceCents: 100000,
    priceNote: null,
    features: [
      "Custom, mobile-first build",
      "Straightforward business site",
      "Tested through Google PageSpeed Insights before launch",
      "You own the domain, code, and content",
    ],
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "website-care",
    group: "websites",
    name: "Website Care",
    blurb: "Hosting and upkeep for a site that is already built, with a limited number of edits each month.",
    monthlyCents: 10000,
    onceCents: null,
    priceNote: null,
    features: [
      "Hosting included",
      "Google PageSpeed Insights performance guarantee",
      "Limited monthly edits",
    ],
    featured: false,
    active: true,
    sortOrder: 20,
  },
  {
    slug: "website-care-growth",
    group: "websites",
    name: "Growth Website Care",
    blurb: "Everything in Website Care, with edits uncapped and your Google presence managed alongside the site.",
    monthlyCents: 25000,
    onceCents: null,
    priceNote: null,
    features: [
      "Hosting included",
      "Google PageSpeed Insights performance guarantee",
      "Unlimited edits",
      "Review management",
      "Google Business Profile management",
    ],
    featured: true,
    active: true,
    sortOrder: 30,
  },
  {
    slug: "website-custom",
    group: "websites",
    name: "Custom Website / Platform",
    blurb: "For sites past about fifteen pages, or anything that has to do more than present information.",
    monthlyCents: null,
    onceCents: null,
    priceNote: null,
    features: [
      "Intricate sites over 15 pages",
      "E-commerce",
      "Portals and memberships",
      "Advanced integrations",
      "Custom functionality",
    ],
    featured: false,
    active: true,
    sortOrder: 40,
  },

  // ---------------------------------------------------------- AI Receptionist
  {
    slug: "receptionist-basic",
    group: "receptionist",
    name: "AI Receptionist Basic",
    blurb: "A realistic voice answering your inbound calls, with one system wired in behind it.",
    monthlyCents: 20000,
    onceCents: null,
    priceNote: null,
    features: [
      "Realistic AI voice",
      "500 included inbound call minutes a month",
      "One integration",
      "Additional usage at $0.35/min",
      "Usage notice at 80% of your included minutes",
      "Maintenance and business-day support",
    ],
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "receptionist-pro",
    group: "receptionist",
    name: "AI Receptionist Pro",
    blurb: "A better voice that handles being interrupted, more included minutes, and up to five systems wired in.",
    monthlyCents: 35000,
    onceCents: null,
    priceNote: null,
    features: [
      "Ultra-realistic AI voice",
      "Natural interruption handling",
      "800 included inbound call minutes a month",
      "Up to five integrations",
      "Additional usage at $0.40/min",
      "Usage notice at 80% of your included minutes",
      "Maintenance and business-day support",
    ],
    featured: true,
    active: true,
    sortOrder: 20,
  },
  {
    slug: "receptionist-enterprise",
    group: "receptionist",
    name: "AI Receptionist Enterprise",
    blurb: "When the voice, the knowledge behind it, and the systems it reaches all need designing from scratch.",
    monthlyCents: null,
    onceCents: null,
    priceNote: null,
    features: [
      "Advanced voice design",
      "Custom knowledge base",
      "MCP connections",
      "Unlimited integrations",
      "Tailored support",
    ],
    featured: false,
    active: true,
    sortOrder: 30,
  },

  // ------------------------------------------------------ Systems & Automation
  {
    slug: "ai-automation",
    group: "systems",
    name: "Custom AI Build & Automation",
    blurb: "Custom AI agents and automations for the parts of the work that currently happen by hand.",
    monthlyCents: null,
    onceCents: null,
    priceNote: null,
    features: [
      "Custom AI agents",
      "Workflow and operations automation",
      "Follow-up automation",
      "Business systems integration",
    ],
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "crm-portal",
    group: "systems",
    name: "Custom CRM & Client Portal",
    blurb: "A CRM shaped around how you actually work, and a portal your clients can be given access to.",
    monthlyCents: null,
    onceCents: null,
    priceNote: null,
    features: [
      "Purpose-built CRM systems",
      "Client portals",
      "Integrations",
      "Workflows and automation",
    ],
    featured: false,
    active: true,
    sortOrder: 20,
  },

  // ------------------------------------------- Brand, Local SEO & Growth
  {
    slug: "ads-management",
    group: "growth",
    name: "Google Ads or Meta Ads Management",
    blurb: "Ongoing campaign management with no setup fee. Billed per active platform; ad spend is separate.",
    monthlyCents: 30000,
    onceCents: null,
    priceNote: null,
    features: [
      "Ongoing campaign management",
      "No setup fee",
      "Billed per active platform",
      "Ad spend billed separately",
    ],
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "funnel-build",
    group: "growth",
    name: "Custom Funnel Build & Management",
    blurb: "A lead funnel built once, then run for you — the landing-page journey and everything behind it.",
    monthlyCents: 30000,
    onceCents: 50000,
    priceNote: null,
    features: [
      "Custom lead funnel",
      "Landing-page journey",
      "Ongoing management",
    ],
    featured: false,
    active: true,
    sortOrder: 20,
  },
  {
    slug: "ai-search-boost",
    group: "growth",
    name: "AI Search Visibility Page Boost",
    blurb: "A page built or rebuilt to be quotable by AI search, not just indexable by Google.",
    monthlyCents: null,
    onceCents: 120000,
    priceNote: null,
    features: [
      "AEO/GEO-focused page build or upgrade",
    ],
    featured: false,
    active: true,
    sortOrder: 30,
  },
  {
    slug: "review-engine",
    group: "growth",
    name: "Review Engine",
    blurb: "Automated follow-up after each job, so the profile keeps moving instead of going stale.",
    monthlyCents: 20000,
    onceCents: null,
    priceNote: null,
    features: [
      "Automated review follow-up",
      "Review management",
      "Reputation support",
    ],
    featured: false,
    active: true,
    sortOrder: 40,
  },

  // ---------------------------------------------------------------- Advisory
  {
    slug: "consultation",
    group: "advisory",
    name: "Free Build Consultation",
    blurb: "What to build, what it should do for you, and roughly what it costs. No charge and no obligation.",
    monthlyCents: null,
    onceCents: null,
    priceNote: "Free",
    features: [
      "Identify what to build",
      "The expected impact",
      "A realistic investment range",
    ],
    featured: false,
    active: true,
    sortOrder: 10,
  },
];

/** Which plan a service page quotes in its "from" line. */
export const SERVICE_PLAN: Record<string, string> = {
  websites: "website-build",
  automations: "ai-automation",
  "ai-receptionist": "receptionist-basic",
  "crm-portals": "crm-portal",
  "brand-seo": "review-engine",
};

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
    return rows.map((row) => ({
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
  } catch {
    return DEFAULT_PLANS;
  }
}

/** The headline price for one service, used by the service-page anchor. */
export async function getServicePrice(serviceSlug: string) {
  const planSlug = SERVICE_PLAN[serviceSlug];
  if (!planSlug) return null;
  const plans = await getPricingPlans();
  return plans.find((p) => p.slug === planSlug) ?? null;
}
