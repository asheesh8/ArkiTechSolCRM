import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/site/page-header";
import { FaqItem } from "@/components/marketing/faq/faq-item";
import { Closing } from "@/components/marketing/site/closing";
import { loadPlans } from "@/lib/marketing/plans";
import { cheapest, money, planNamed, plansIn, startingPrice, type Plan } from "@/lib/marketing/plan-display";
import { SPEED_FLOOR } from "@/lib/pagespeed-audit";
import { SITE } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "FAQ | ArkiTech Solutions",
  description:
    "What a website costs, who owns it, how long a build takes, how the AI receptionist works, and what happens if you want to leave.",
};


type Faq = { q: string; a: string; link?: { href: string; label: string } };

// Prices are read from the same rows as the pricing page, so the FAQ can
// never quote a different number again (the old page said $195 and $4,500
// long after the plans changed).
function websiteAnswer(plans: Plan[]) {
  const web = plansIn(plans, "websites");
  const basic = planNamed(web, "HostBasic") ?? cheapest(web, "monthlyCents");
  const pro = planNamed(web, "HostPro");
  const own = cheapest(web, "onceCents");
  return [
    basic?.monthlyCents != null ? `${basic.name} is ${money(basic.monthlyCents)} a month and covers hosting and limited edits.` : "",
    pro?.monthlyCents != null
      ? `${pro.name}, at ${money(pro.monthlyCents)}, adds unlimited edits turned around in 24 hours and Google Business Profile management.`
      : "",
    own?.onceCents != null ? `If you'd rather own it outright, a custom build is ${money(own.onceCents)} once.` : "",
    "Everything is on the pricing page; we don't make you ask.",
  ]
    .filter(Boolean)
    .join(" ");
}

function sections(plans: Plan[]): { heading: string; items: Faq[] }[] {
  const reception = startingPrice("ai-receptionist", plans);
  return [
  {
    heading: "Money",
    items: [
      {
        q: "What does a website cost?",
        a: websiteAnswer(plans),
        link: { href: "/pricing", label: "See every plan" },
      },
      {
        q: "Is there a contract or a lock-in?",
        a: "No. Every recurring plan is month to month. Cancel whenever and you keep the domain, the code, and the content. We hand over the repository and point the domain wherever you want it.",
      },
      {
        q: "Are there setup fees or hidden costs?",
        a: `Nothing hidden. Website plans have no setup fee and hosting is inside the monthly price. The AI receptionist has a one-time build fee${reception.amount ? `, from ${reception.amount}` : ""}, printed next to its monthly price. Anything else billed on top is printed next to the plan, like metered minutes if your receptionist goes past what's included.`,
      },
      {
        q: "Why is some work built to scope?",
        a: "Because an honest number needs a scope. Automations and CRM builds vary by an order of magnitude depending on how many tools have to talk and how bespoke your process is. You get a fixed written quote after the call, before anything starts.",
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
      {
        q: "How do edits work after launch?",
        a: "On HostPro and HostSOL they're unlimited and turned around within 24 hours; HostBasic includes limited edits. Email or text us what needs changing. There's no ticket system and no per-change fee.",
      },
      {
        q: "Can you work with the site I already have?",
        a: "Sometimes. ReviewRetainer, the AI receptionist, and most automations sit alongside whatever you're running now. A rebuild is usually the honest answer if the existing site is on a builder and the speed is the problem. We'll tell you which case you're in on the call.",
      },
    ],
  },
  {
    heading: "How it runs",
    items: [
      {
        q: "Does the AI receptionist sound like a robot?",
        a: "It sounds like a competent receptionist reading from your notes, and it says it's an assistant if asked. It knows your services, pricing, and service area, books into your calendar, and hands off to a real number on request. It is not trying to pass as a person.",
      },
      {
        q: "Who actually does the work?",
        a: "Ashish builds it. Teibiroa handles the relationship. Nothing is outsourced and nothing is passed to a junior after you sign. The person on the call is the person writing the code.",
      },
      {
        q: "Do you only work with Vermont businesses?",
        a: "We're in Burlington and most of our work is in Vermont, which matters for local SEO because we know the towns. But the websites, automations, and receptionist work fine anywhere in the US.",
      },
      {
        q: "What happens on the first call?",
        a: "Twenty minutes, no obligation, no deck. We ask what's actually costing you time or jobs, and tell you whether we can help. If we're not the right fit we'll say so on that call rather than sell you something adjacent.",
      },
    ],
  },
  ];
}

// The website and receptionist answers quote live prices.
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
