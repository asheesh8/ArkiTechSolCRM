import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { FaqItem } from "@/components/landing/faq-item";
import { SPEED_FLOOR } from "@/lib/pagespeed-audit";

export const metadata: Metadata = {
  title: "FAQ — ArkiTech Solutions",
  description:
    "What a website costs, who owns it, how long a build takes, how the AI receptionist works, and what happens if you want to leave.",
};

type Faq = { q: string; a: React.ReactNode };

const SECTIONS: { heading: string; items: Faq[] }[] = [
  {
    heading: "Money",
    items: [
      {
        q: "What does a website cost?",
        a: (
          <>
            $195 a month with nothing down, or $4,500 once if you&apos;d rather own it outright. The
            monthly includes hosting, unlimited edits, and the admin side. Everything is on the{" "}
            <Link href="/pricing" className="underline underline-offset-4">pricing page</Link>{" "}
            &mdash; we don&apos;t make you ask.
          </>
        ),
      },
      {
        q: "Is there a contract or a lock-in?",
        a: "No. Every recurring plan is month to month. Cancel whenever and you keep the domain, the code, and the content — we hand over the repository and point the domain wherever you want it.",
      },
      {
        q: "Are there setup fees or hidden costs?",
        a: "No setup fee on any plan, and hosting is inside the monthly price. The only things billed on top are the ones printed next to the plan: extra pages, and metered minutes if your AI receptionist goes past what's included.",
      },
      {
        q: "Why is project work priced “from”?",
        a: "Because an honest number needs a scope. Automations and CRM builds vary by an order of magnitude depending on how many tools have to talk and how bespoke your process is. You get a fixed written quote after the call, before anything starts — the “from” is the floor, not a teaser.",
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
        a: `We keep working until it does, free. The guarantee is ${SPEED_FLOOR}+ mobile Performance on Google PageSpeed Insights, measured on the live site with Google's own tool — you can run it yourself the day it launches.`,
      },
      {
        q: "How long does a build take?",
        a: "Two to four weeks for a standard site, from the first call to launch. The variable is almost never us — it's how quickly we get your photos, your service list, and your feedback on the first draft.",
      },
      {
        q: "How do edits work after launch?",
        a: "On a monthly plan they're unlimited and turned around within 24 hours. Email or text us what needs changing. There's no ticket system and no per-change fee.",
      },
      {
        q: "Can you work with the site I already have?",
        a: "Sometimes. ReviewRetainer, the AI receptionist, and most automations sit alongside whatever you're running now. A rebuild is usually the honest answer if the existing site is on a builder and the speed is the problem — we'll tell you which case you're in on the call.",
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
        a: "Ashish builds it. Teibiroa handles the relationship. Nothing is outsourced and nothing is passed to a junior after you sign — the person on the call is the person writing the code.",
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

export default function FaqPage() {
  return (
    <main className="site min-h-screen">
      <SiteNav />

      <section className="band-ink site-section pt-[calc(var(--nav-h)+5rem)]">
        <div className="site-shell max-w-4xl">
          <Reveal>
            <p className="eyebrow">FAQ</p>
            <h1 className="d1 max-w-[12ch]">The questions we always get.</h1>
            <p className="lede mt-10 max-w-[48ch]">
              If yours isn&apos;t here, call{" "}
              <a href="tel:+18023103749" className="underline underline-offset-4">(802) 310-3749</a>{" "}
              and ask. You&apos;ll get a person.
            </p>
          </Reveal>

          {SECTIONS.map((section, s) => (
            <div key={section.heading} className="mt-20">
              <Reveal>
                <p className="mono pb-5" style={{ color: "var(--dim)" }}>{section.heading}</p>
              </Reveal>

              <div className="ledger">
                {section.items.map((item, i) => (
                  <Reveal key={item.q} delay={i * 50}>
                    <FaqItem
                      index={`${s + 1}.${String(i + 1).padStart(2, "0")}`}
                      question={item.q}
                    >
                      {item.a}
                    </FaqItem>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="band-violet site-section">
        <div className="site-shell">
          <Reveal>
            <p className="eyebrow">Still wondering</p>
            <h2 className="d2 max-w-[13ch]">Ask us the awkward one.</h2>
            <p className="lede mt-8 max-w-[44ch]">
              Twenty minutes, no obligation, and we&apos;ll tell you if we&apos;re not the right fit.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="tel:+18023103749" className="btn btn-solid">Call (802) 310-3749</a>
              <Link href="/pricing" className="btn btn-outline">See pricing</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
