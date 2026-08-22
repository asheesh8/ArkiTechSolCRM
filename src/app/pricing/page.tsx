import type { Metadata } from "next";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { PricingTabs } from "@/components/landing/pricing-tabs";
import { getPricingPlans } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — ArkiTech Solutions",
  description:
    "What our websites, review generation, AI reception, systems work, and local SEO cost. Month to month, no hidden fees.",
};

// Prices come from the database so owners can change them in CRM settings.
// Five minutes is short enough that an edit shows up quickly and long enough
// that the page stays effectively static for visitors; the settings route also
// revalidates this path on save, so a change is usually immediate.
export const revalidate = 300;

const ALWAYS: [string, string][] = [
  ["Month to month", "No lock-in on any recurring plan. Cancel and you keep the domain, the code, and the content."],
  ["No hidden fees", "Hosting is in the monthly price. The number you see is the number you pay."],
  ["Scoped before it starts", "Anything marked “from” is quoted in writing after the call, before work begins."],
  ["Real people", "Burlington, Vermont. You talk to whoever is building it."],
];

export default async function PricingPage() {
  const plans = await getPricingPlans();

  return (
    <main className="site min-h-screen">
      <SiteNav />

      <section className="band-ink site-section pt-[calc(var(--nav-h)+5rem)]">
        <div className="site-shell">
          <Reveal>
            <p className="eyebrow">Pricing</p>
            <h1 className="d1 max-w-[13ch]">What it costs.</h1>
            <p className="lede mt-10 max-w-[50ch]">
              Published, because making people ask is a tactic and we&apos;d rather not use it.
              Recurring plans are month to month. Project work is quoted in writing before anything
              starts.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="band-raised site-section">
        <div className="site-shell">
          <PricingTabs plans={plans} />
        </div>
      </section>

      <section className="band-paper site-section">
        <div className="site-shell">
          <Reveal>
            <p className="eyebrow">On every plan</p>
            <h2 className="d2" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>
              The parts that never change.
            </h2>
          </Reveal>

          <Reveal delay={110}>
            <dl className="ledger mt-14">
              {ALWAYS.map(([term, detail], i) => (
                <div
                  key={term}
                  className="grid gap-x-10 gap-y-2 border-b py-7 sm:grid-cols-[3.5rem_1fr_1.4fr]"
                  style={{ borderColor: "var(--rule)" }}
                >
                  <dt className="figure-index">{String(i + 1).padStart(2, "0")}</dt>
                  <dt className="d3" style={{ fontSize: "clamp(1.15rem, 1.7vw, 1.4rem)" }}>{term}</dt>
                  <dd className="text-sm" style={{ color: "var(--dim)", lineHeight: 1.7 }}>{detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
