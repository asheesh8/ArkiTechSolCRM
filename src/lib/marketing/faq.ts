import { money, plansIn, type Plan } from "@/lib/marketing/plan-display";
import { SPEED_FLOOR } from "@/lib/pagespeed-audit";

/**
 * Questions and answers, as data. Each page that shows a set renders it and
 * builds its FAQPage schema from the same array, so the schema can never say
 * something the page doesn't. Answers are plain text (they go into JSON-LD
 * as-is); `link` is rendered under the answer. `todo` is an owner note shown
 * in development only and never in the answer or the schema.
 */
export type Faq = { q: string; a: string; link?: { href: string; label: string }; todo?: string };

const find = (plans: Plan[], slug: string) => plans.find((p) => p.slug === slug && p.active !== false);

/** Live prices, read from the pricing table, as the words the answers use. */
export function priceWords(plans: Plan[]) {
  const partner = find(plans, "growth-partnership");
  const site = find(plans, "custom-website");
  const aeo = find(plans, "ai-search");
  const addon = plansIn(plans, "addons").find((p) => p.monthlyCents != null);
  return {
    partner: partner?.monthlyCents != null ? `${money(partner.monthlyCents)}/month` : "the Growth Partnership price",
    siteBuild: site?.onceCents != null ? money(site.onceCents) : "the Custom Website price",
    siteMonthly: site?.monthlyCents != null ? `${money(site.monthlyCents)}/month` : "the monthly plan",
    aeo: aeo?.onceCents != null ? money(aeo.onceCents) : "the AEO & GEO build price",
    addon: addon?.monthlyCents != null ? `${money(addon.monthlyCents)}/month` : "the add-on price",
    addonNames: plansIn(plans, "addons").map((p) => p.name),
  };
}

/** The pricing page's question sections, also the start of the FAQ hub's money group. */
export function pricingQuestions(plans: Plan[]): Faq[] {
  const w = priceWords(plans);
  return [
    {
      q: "Which plan is right for my business?",
      a: `If you want a new website plus someone to run your Google Business Profile and ask customers for reviews, choose the Growth Partnership at ${w.partner} for 12 months. If you only need a website and will handle Google yourself, choose the Custom Website: ${w.siteBuild} to build, plus ${w.siteMonthly} you can cancel anytime. If you want pages written to be found and cited by answer engines like ChatGPT, choose the ${w.aeo} AEO & GEO Website Build.`,
    },
    {
      q: "Can I cancel?",
      a: `The Growth Partnership is a 12-month contract. The Custom Website's ${w.siteMonthly} plan can be cancelled anytime. The AEO & GEO Website Build is a one-time ${w.aeo} project, so there is nothing to cancel once it's delivered.`,
      todo: "say what happens if a Growth Partnership client wants to leave before 12 months, and at the end of the term.",
    },
    {
      q: "Do I own my website?",
      a: "With the Custom Website you don't have to host with us, so the site can live wherever you choose. After the AEO & GEO Website Build, you pick one of our hosting plans or own the site outright.",
      todo: "confirm who owns the site, domain and content under the Growth Partnership, during and after the 12 months.",
    },
    {
      q: "Do I have to host with you?",
      a: "No. The Custom Website has no requirement to host with us. After an AEO & GEO Website Build you can choose a hosting plan with us or take the site and own it outright.",
      todo: "confirm hosting is included in the Growth Partnership, and say so here.",
    },
    {
      q: "Are there setup fees or hidden costs?",
      a: `No. Every price is on the pricing page. The only extras are dashboard add-ons${w.addonNames.length ? ` (${w.addonNames.join(", ")})` : ""} at ${w.addon} each, and you choose whether to add them.`,
    },
    {
      q: "What does the PageSpeed guarantee mean?",
      a: `It means the site is fast for visitors on phones. We guarantee a ${SPEED_FLOOR}+ mobile Performance score on Google PageSpeed Insights, measured on the live site with Google's own tool, and keep working on it free until it gets there. It's about the experience your visitors have, not a promise about Google rankings.`,
    },
  ];
}
