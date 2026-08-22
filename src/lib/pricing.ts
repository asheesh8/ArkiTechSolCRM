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
    label: "Websites & Reviews",
    blurb: "The site, the admin side behind it, and the review engine that keeps your Google profile moving.",
  },
  {
    key: "receptionist",
    label: "AI Receptionist",
    blurb: "A voice agent that answers, qualifies, and books — so the phone stops costing you jobs.",
  },
  {
    key: "systems",
    label: "Systems & Automation",
    blurb: "Scoped work. The range depends on how many tools have to talk and how much of your process is bespoke.",
  },
  {
    key: "growth",
    label: "Brand & Local SEO",
    blurb: "Being findable and being credible, measured rather than asserted.",
  },
] as const;

export const DEFAULT_PLANS: PricingPlan[] = [
  {
    slug: "website",
    group: "websites",
    name: "Website",
    blurb: "A hand-built site with an admin side showing every lead that comes in. No upfront cost, cancel any time.",
    monthlyCents: 19500,
    onceCents: null,
    priceNote: null,
    features: [
      "$0 down, month to month",
      "Up to 6 pages, hand-coded",
      "Hosting and domain setup included",
      "Admin dashboard for leads and enquiries",
      "Unlimited edits, turned around in 24h",
      "PageSpeed guarantee — 90+ or we fix it free",
      "You own the domain, code, and content",
    ],
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "website-reviews",
    group: "websites",
    name: "Website + ReviewRetainer",
    blurb: "The site plus the review engine. Every finished job turns into a request, so the profile never goes stale.",
    monthlyCents: 29900,
    onceCents: null,
    priceNote: null,
    features: [
      "Everything in Website",
      "60 review requests a month",
      "Requests by text and email after each job",
      "Only real customers ever get asked",
      "Missed-call text-back",
      "Review alerts and reply drafting",
      "Monthly report on rating and volume",
    ],
    featured: true,
    active: true,
    sortOrder: 20,
  },
  {
    slug: "reviewretainer",
    group: "websites",
    name: "ReviewRetainer only",
    blurb: "Already happy with your site? Run the review engine on its own.",
    monthlyCents: 14900,
    onceCents: null,
    priceNote: null,
    features: [
      "60 review requests a month",
      "Text and email, sent after each job",
      "Missed-call text-back",
      "Review alerts and reply drafting",
      "Works alongside whatever site you have",
    ],
    featured: false,
    active: true,
    sortOrder: 30,
  },
  {
    slug: "website-once",
    group: "websites",
    name: "Website, paid once",
    blurb: "Prefer to own it outright? Same build, one invoice, no monthly.",
    monthlyCents: 2500,
    onceCents: 450000,
    priceNote: null,
    features: [
      "Same hand-coded build",
      "Up to 6 pages",
      "$25/mo hosting after launch",
      "Edits billed hourly, or add a plan later",
      "You own everything from day one",
    ],
    featured: false,
    active: true,
    sortOrder: 40,
  },
  {
    slug: "receptionist-afterhours",
    group: "receptionist",
    name: "After-hours & overflow",
    blurb: "Picks up when you can't — evenings, weekends, and whenever the line is already busy.",
    monthlyCents: 19900,
    onceCents: null,
    priceNote: null,
    features: [
      "200 answered minutes included",
      "$0.32/min after that",
      "Name, number, job type, and address captured",
      "Full transcript on the client record",
      "Hands off to a real number on request",
      "No setup fee",
    ],
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "receptionist-full",
    group: "receptionist",
    name: "Full-day answering",
    blurb: "Every call answered, qualified, and booked straight into the calendar.",
    monthlyCents: 34900,
    onceCents: null,
    priceNote: null,
    features: [
      "600 answered minutes included",
      "$0.28/min after that",
      "Books into your live calendar",
      "Knows your services, pricing, and service area",
      "Qualifies the job before it reaches you",
      "Logged against the lead in your CRM",
      "No setup fee",
    ],
    featured: true,
    active: true,
    sortOrder: 20,
  },
  {
    slug: "automations",
    group: "systems",
    name: "Automations",
    blurb: "Follow-up sequences, and the tools you already pay for wired together through their APIs.",
    monthlyCents: 9500,
    onceCents: 180000,
    priceNote: "From",
    features: [
      "Scoped and quoted before anything starts",
      "Follow-up sequences by SMS and email",
      "Scheduling wired to real availability",
      "API connections between your existing tools",
      "Invoice and quote chasing",
      "$95/mo to keep it running and monitored",
    ],
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "crm-portals",
    group: "systems",
    name: "CRM & Client Portals",
    blurb: "A CRM built to your workflow rather than a vendor's, with a client portal on the front.",
    monthlyCents: 18000,
    onceCents: 650000,
    priceNote: "From",
    features: [
      "Your stages, your fields, your handoffs",
      "Client portal for quotes, contracts, invoices",
      "Calls, texts, and notes threaded per contact",
      "Team roles as you add people",
      "$180/mo hosting, backups, and support",
      "Price moves with how bespoke the process is",
    ],
    featured: false,
    active: true,
    sortOrder: 20,
  },
  {
    slug: "local-seo",
    group: "growth",
    name: "Local SEO",
    blurb: "Google Business Profile, location pages, and a PageSpeed audit re-run after every build.",
    monthlyCents: 45000,
    onceCents: null,
    priceNote: null,
    features: [
      "Google Business Profile built out and maintained",
      "Location pages for the towns you serve",
      "Keyword and competitor tracking",
      "PageSpeed audits against you and whoever outranks you",
      "Monthly report you can actually read",
    ],
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    slug: "brand",
    group: "growth",
    name: "Brand identity",
    blurb: "Logo, palette, and type that hold up on a truck door and a business card, not just a screen.",
    monthlyCents: null,
    onceCents: 240000,
    priceNote: "From",
    features: [
      "Logo and wordmark",
      "Palette and type system",
      "Print-ready files for signage and vehicles",
      "Photography direction for real job sites",
      "Brand guide so it stays consistent",
    ],
    featured: false,
    active: true,
    sortOrder: 20,
  },
];

/** Which plan a service page quotes in its "from" line. */
export const SERVICE_PLAN: Record<string, string> = {
  websites: "website",
  automations: "automations",
  "ai-receptionist": "receptionist-afterhours",
  "crm-portals": "crm-portals",
  "brand-seo": "local-seo",
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
