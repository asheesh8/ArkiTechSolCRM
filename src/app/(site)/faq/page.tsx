import Link from "next/link";
import { PageHeader } from "@/components/marketing/site/page-header";
import { FaqItem } from "@/components/marketing/faq/faq-item";
import { Closing } from "@/components/marketing/site/closing";
import { loadPlans } from "@/lib/marketing/plans";
import { money, plansIn, type Plan } from "@/lib/marketing/plan-display";
import { SPEED_FLOOR } from "@/lib/pagespeed-audit";
import { SITE } from "@/lib/marketing/site";
import { pageMetadata } from "@/lib/marketing/seo";

export const metadata = pageMetadata({
  title: "Website Design FAQ: Cost, Ownership, Timelines | ArkiTech",
  description:
    "What the Growth Partnership and a custom website cost, how long a build takes, what the dashboards do, and how AI search optimization works. Straight answers.",
  path: "/faq",
});


type Faq = { q: string; a: string; link?: { href: string; label: string } };

// Prices are read from the same rows as the pricing page, so the FAQ can
// never quote a different number again (the old page said $195 and $4,500
// long after the plans changed).
function priceOf(plans: Plan[], slug: string) {
  return plans.find((p) => p.slug === slug && p.active !== false);
}

function costAnswer(plans: Plan[]) {
  const partner = priceOf(plans, "growth-partnership");
  const site = priceOf(plans, "custom-website");
  const search = priceOf(plans, "ai-search");
  return [
    partner?.monthlyCents != null
      ? `The ${partner.name} is ${money(partner.monthlyCents)} a month for 12 months: your website, Google Business Profile management, review requests, and the Overview and CRM dashboards.`
      : "",
    site?.onceCents != null
      ? `A ${site.name} is ${money(site.onceCents)} once${site.monthlyCents != null ? `, with an optional ${money(site.monthlyCents)} a month plan that adds the Overview and CRM dashboards` : ""}.`
      : "",
    search?.onceCents != null ? `${search.name} is a ${money(search.onceCents)} one-time build.` : "",
    "Everything is on the pricing page; we don't make you ask.",
  ]
    .filter(Boolean)
    .join(" ");
}

function addonAnswer(plans: Plan[]) {
  const addons = plansIn(plans, "addons");
  const each = addons.find((p) => p.monthlyCents != null)?.monthlyCents;
  const names = addons.map((p) => p.name);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names.join("");
  return `Nothing hidden. Every price is printed on the pricing page. The only extras are the dashboard add-ons${list ? ` (${list})` : ""}${each != null ? `, at ${money(each)} a month each` : ""}, and you choose whether to add them.`;
}

function sections(plans: Plan[]): { heading: string; items: Faq[] }[] {
  return [
  {
    heading: "Money",
    items: [
      {
        q: "What does it cost?",
        a: costAnswer(plans),
        link: { href: "/pricing", label: "See every plan" },
      },
      {
        q: "Is there a contract or a lock-in?",
        a: "The Growth Partnership is a 12-month partnership. The Custom Website is paid once, and its monthly plan is optional: cancel it whenever you like. AI Search Optimization is a one-time build.",
      },
      {
        q: "Are there setup fees or hidden costs?",
        a: addonAnswer(plans),
      },
    ],
  },
  {
    heading: "The work",
    items: [
      {
        q: "Do you use WordPress, Wix, or a page builder?",
        a: "No. Everything is hand-written. A builder ships the code for every feature it might ever need on every page whether you use it or not, and your visitors pay for that on every single load. It's the main reason builder sites are slow.",
      },
      {
        q: `What if my site doesn't hit ${SPEED_FLOOR} on Google?`,
        a: `We keep working until it does, free. The guarantee is ${SPEED_FLOOR}+ mobile Performance on Google PageSpeed Insights, measured on the live site with Google's own tool. You can run it yourself the day it launches.`,
      },
      {
        q: "How long does a build take?",
        a: "Two to four weeks for a standard site, from the first call to launch. The variable is almost never us. It's how quickly we get your photos, your service list, and your feedback on the first draft.",
      },
    ],
  },
  {
    heading: "How it runs",
    items: [
      {
        q: "What are the dashboards?",
        a: "The Overview and CRM dashboards come with the Growth Partnership and with the Custom Website's monthly plan: every lead and client in one place, and the state of the business at a glance. You can add Analytics (Google Analytics, Meta and your social media), Finance (quotes, money in and out), an AI Assistant that answers questions from all your data, and Scheduling, which syncs your calendars into one.",
        link: { href: "/services/dashboards", label: "More on the dashboards" },
      },
      {
        q: "What is AI search optimization?",
        a: "More people now ask ChatGPT, Claude and other AI assistants who to hire. We build 200 unique, keyword-driven pages so those answer engines have something specific to recommend your business for.",
        link: { href: "/services/ai-search", label: "More on AI search" },
      },
      {
        q: "Who actually does the work?",
        a: "Ashish builds it. Terri handles the relationship. Nothing is outsourced and nothing is passed to a junior after you sign. The person on the call is the person writing the code.",
      },
      {
        q: "Do you only work with Vermont businesses?",
        a: "No. The studio is in Burlington, Vermont, but we work remotely with businesses anywhere in the US. Calls, reviews and launches all happen online.",
      },
      {
        q: "What happens on the first call?",
        a: "Twenty minutes, no obligation, no deck. We ask what's actually costing you time or jobs, and tell you whether we can help. If we're not the right fit we'll say so on that call rather than sell you something adjacent.",
      },
    ],
  },
  ];
}

// The money answers quote live prices.
export const revalidate = 300;

export default async function FaqPage() {
  const SECTIONS = sections(await loadPlans());
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SECTIONS.flatMap((s) =>
      s.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader
        kicker="Website design FAQ"
        title="The questions we always get."
        lede={
          <>
            If yours isn&apos;t here, call{" "}
            <a href={SITE.phoneHref} className="text-link text-[var(--fg)]">
              {SITE.phone}
            </a>{" "}
            and ask. You&apos;ll get a person.
          </>
        }
      />
      <section className="band pb-24 sm:pb-32">
        <div className="shell grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20">
          <nav aria-label="FAQ sections" className="hidden lg:block">
            <ul className="sticky top-28 grid gap-3 border-l border-[var(--rule)] pl-5">
              {SECTIONS.map((s) => (
                <li key={s.heading}>
                  <a href={`#${s.heading.toLowerCase().replace(/\s+/g, "-")}`} className="text-[var(--fg-2)] hover:text-[var(--fg)]">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid gap-16">
            {SECTIONS.map((s, si) => (
              <div key={s.heading} id={s.heading.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-28">
                <h2 className="text-sm text-[var(--dim)]">{s.heading}</h2>
                <div className="mt-3 border-t border-[var(--rule)]">
                  {s.items.map((item, i) => (
                    <FaqItem key={item.q} question={item.q} defaultOpen={si === 0 && i === 0}>
                      <p>{item.a}</p>
                      {item.link ? (
                        <Link href={item.link.href} className="ak-arrow-link mt-4">
                          {item.link.label} <span aria-hidden="true">→</span>
                        </Link>
                      ) : null}
                    </FaqItem>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Closing title="Ask us the awkward one." body="Twenty minutes, no obligation, and we'll tell you if we're not the right fit." />
    </>
  );
}
