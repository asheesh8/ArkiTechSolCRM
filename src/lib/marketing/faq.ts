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
  return {
    partner: partner?.monthlyCents != null ? `${money(partner.monthlyCents)}/month` : "the Growth Partnership price",
    siteBuild: site?.onceCents != null ? money(site.onceCents) : "the Custom Website price",
    siteMonthly: site?.monthlyCents != null ? `${money(site.monthlyCents)}/month` : "the monthly plan",
    aeo: aeo?.onceCents != null ? money(aeo.onceCents) : "the AEO & GEO build price",
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
      a: `The Growth Partnership is a 12-month contract. The Custom Website's ${w.siteMonthly} plan can be cancelled anytime. The AEO & GEO Website Build is a one-time ${w.aeo} project, so there is nothing to cancel once it's delivered. Whichever plan you pick, the terms are agreed in writing before any work starts.`,
      todo: "say what happens if a Growth Partnership client wants to leave before 12 months, and at the end of the term.",
    },
    {
      q: "Do I own my website?",
      a: "With the Custom Website you don't have to host with us, so the site can live wherever you choose. After the AEO & GEO Website Build, you pick one of our hosting plans or own the site outright. Either way, you decide where the site lives.",
      todo: "confirm who owns the site, domain and content under the Growth Partnership, during and after the 12 months.",
    },
    {
      q: "Do I have to host with you?",
      a: "No. The Custom Website has no requirement to host with us, so you can keep the site wherever suits you. After an AEO & GEO Website Build you can choose a hosting plan with us or take the site and own it outright.",
      todo: "confirm hosting is included in the Growth Partnership, and say so here.",
    },
    {
      q: "Are there setup fees or hidden costs?",
      a: `No. Every plan's price is on the pricing page, and it's the whole price for what that plan lists. The only optional extras are dashboard add-ons${w.addonNames.length ? ` (${w.addonNames.join(", ")})` : ""}, which you choose whether to add; ask us about them on the call.`,
    },
    {
      q: "What does the PageSpeed guarantee mean?",
      a: `It means the site is fast for visitors on phones. We guarantee a ${SPEED_FLOOR}+ mobile Performance score on Google PageSpeed Insights, measured on the live site with Google's own tool, and keep working on it free until it gets there. It's about the experience your visitors have, not a promise about Google rankings.`,
    },
  ];
}

export type FaqGroup = { heading: string; items: Faq[] };

const pick = (items: Faq[], q: string) => {
  const item = items.find((i) => i.q === q);
  if (!item) throw new Error(`No pricing question "${q}"`);
  return item;
};

/**
 * The FAQ hub, by group. Each answer is 40-80 words and links to the page
 * with the full story. The money and contract answers are the pricing page's,
 * so the two can never disagree.
 */
export function faqGroups(plans: Plan[]): FaqGroup[] {
  const w = priceWords(plans);
  const pricing = pricingQuestions(plans);
  return [
    {
      heading: "Money",
      items: [
        {
          q: "What does it cost?",
          a: `There are three plans. The Growth Partnership is ${w.partner} for 12 months: website, Google Business Profile management, review requests and replies, and the Overview and CRM dashboards. The Custom Website is ${w.siteBuild} to build plus ${w.siteMonthly}, cancel anytime. The AEO & GEO Website Build is ${w.aeo} one time. More dashboards can be added to either website plan.`,
          link: { href: "/pricing", label: "See every plan" },
        },
        { ...pick(pricing, "Which plan is right for my business?"), link: { href: "/pricing", label: "Compare the plans" } },
        { ...pick(pricing, "Are there setup fees or hidden costs?"), link: { href: "/pricing", label: "See every price" } },
      ],
    },
    {
      heading: "Contracts & ownership",
      items: [
        { ...pick(pricing, "Can I cancel?"), link: { href: "/pricing", label: "Plan terms" } },
        { ...pick(pricing, "Do I own my website?"), link: { href: "/pricing", label: "Plan terms" } },
        { ...pick(pricing, "Do I have to host with you?"), link: { href: "/services/websites", label: "The Custom Website" } },
      ],
    },
    {
      heading: "AEO & GEO",
      items: [
        {
          q: "What are AEO and GEO?",
          a: "AEO (answer engine optimization) is shaping pages so tools like ChatGPT and Google AI Overviews can lift a clear answer from them. GEO (generative engine optimization) is being cited when those tools write an answer. Both rest on the same groundwork as SEO: useful, accurate pages that crawlers can read.",
          link: { href: "/aeo-geo/seo-vs-aeo-vs-geo", label: "SEO vs AEO vs GEO" },
        },
        {
          q: "What's in the AEO & GEO Website Build?",
          a: `200 unique, value-packed pages, each answering a real question your customers ask, written so answer engines like ChatGPT, Perplexity, Google AI Overviews, Gemini and Claude can find and cite them. It's a ${w.aeo} one-time build; afterwards you choose a hosting plan or own the site outright.`,
          link: { href: "/services/ai-search", label: "The AEO & GEO Website Build" },
        },
        {
          q: "Can you guarantee my business shows up in ChatGPT?",
          a: "No, and nobody honestly can. ChatGPT, Google and the other AI tools decide what they show and change how they decide. What we can do is make your pages clear, accurate and easy to cite, and keep your business facts the same everywhere they appear.",
          link: { href: "/aeo-geo/how-to-get-recommended-by-chatgpt", label: "How to get recommended by ChatGPT" },
        },
      ],
    },
    {
      heading: "Google Business Profile & reviews",
      items: [
        {
          q: "What does Google Business Profile management include?",
          a: "Keeping your Google listing complete and current: name, phone, hours, services and photos, plus replies to your reviews and 30 review requests a month. It's part of the Growth Partnership. Google says local ranking depends on relevance, distance and prominence, and that no one can pay for a better position.",
          link: { href: "/local-seo/google-business-profile-management", label: "Google Business Profile management" },
          todo: "list exactly what monthly profile management includes.",
        },
        {
          q: "How do the 30 review requests a month work?",
          a: "On the Growth Partnership we send 30 review requests a month on your behalf, each with a direct link to your Google review form. We never offer anything in exchange for a review, and we don't pick only the customers we expect to be happy: both are against Google's rules.",
          link: { href: "/local-seo/google-reviews", label: "Getting Google reviews the right way" },
          todo: "say how requests go out (text, email or both) and when.",
        },
        {
          q: "Why do you reply to reviews?",
          a: "Because the next customer reads them. A thank-you on a good review shows you notice, and a calm reply to a bad one shows how you handle problems. Replies are about trust with the people reading, not a trick for rankings. They're included in the Growth Partnership.",
          link: { href: "/local-seo/google-reviews", label: "More on replying to reviews" },
        },
      ],
    },
    {
      heading: "The work",
      items: [
        {
          q: "Do you use WordPress, Wix, or a page builder?",
          a: "No. Everything is hand-written. A builder ships the code for every feature it might ever need on every page, whether you use it or not, and your visitors pay for that on every load. It's the main reason builder sites are slow on phones.",
          link: { href: "/services/websites", label: "Custom website design" },
        },
        { ...pick(pricing, "What does the PageSpeed guarantee mean?"), link: { href: "/services/websites", label: "Custom website design" } },
        {
          q: "How long does a build take?",
          a: "Two to four weeks for a standard site, from the first call to launch. The variable is almost never us. It's how quickly we get your photos, your service list, and your feedback on the first draft. Larger builds, like the 200-page AEO & GEO build, take longer.",
          todo: "say how long the AEO & GEO Website Build usually takes.",
        },
        {
          q: "What are the dashboards?",
          a: `The Overview and CRM dashboards come with the Growth Partnership and the Custom Website's monthly plan: every lead and client in one place, and the business at a glance. You can also add Analytics, Finance, an AI Assistant and Scheduling to either website plan.`,
          link: { href: "/services/dashboards", label: "Dashboards & CRM" },
        },
      ],
    },
    {
      heading: "How it runs",
      items: [
        {
          q: "Who actually does the work?",
          a: "Ashish builds it. Terri handles the relationship. Nothing is outsourced and nothing is passed to a junior after you sign. The person on the call is the person writing the code or looking after your account, and you can reach both of us directly.",
          link: { href: "/about", label: "About us" },
        },
        {
          q: "Do you only work with Vermont businesses?",
          a: "No. We're based in Essex Junction, next to Burlington, and most of our clients are in Chittenden County and across Vermont, which helps with local search because we know the towns. We also work remotely with businesses anywhere in the US. Calls, reviews and launches all happen online.",
          link: { href: "/service-areas", label: "Where we work" },
        },
        {
          q: "What happens on the first call?",
          a: "A 30-minute call, no obligation. We ask what's costing you time or customers, look at what you have now, and tell you which plan fits, or whether you need one at all. If we're not the right fit, we'll say so on that call rather than sell you something.",
        },
      ],
    },
  ];
}
