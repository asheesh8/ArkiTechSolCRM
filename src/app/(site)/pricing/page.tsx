import type { Metadata } from "next";
import Link from "next/link";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/marketing/site/page-header";
import { PricingTabs } from "@/components/marketing/pricing/pricing-tabs";
import { Reveal } from "@/components/marketing/site/reveal";
import { Closing } from "@/components/marketing/site/closing";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { GROUPS, loadPlans } from "@/lib/marketing/plans";

export const metadata: Metadata = {
  title: "Pricing | ArkiTech Solutions",
  description:
    "What our websites, AI reception, systems work, brand and local SEO cost. Websites from $99 a month. Month to month, no hidden fees.",
};

const ALWAYS: [string, string][] = [
  ["Month to month", "No lock-in on any recurring plan. Cancel and you keep the domain, the code, and the content."],
  ["No hidden fees", "Your initial build fee and ongoing monthly price are shown separately and clearly."],
  ["Scoped before it starts", "Anything built to scope is quoted in writing after the call, before work begins."],
  ["Real people", "Burlington, Vermont. You talk to whoever is building it."],
];

// Prices live in the database and owners change them from CRM settings,
// which also revalidates this path directly.
export const revalidate = 300;

export default async function PricingPage() {
  const plans = await loadPlans();
  return (
    <>
      <PageHeader
        title="What it costs."
        lede="Published, because making people ask is a tactic and we'd rather not use it. Recurring plans are month to month. Project work is quoted in writing before anything starts."
      >
        <ContactButton />
        <a href="/ArkiTech-Solutions-Pricing-Guide.pdf" download className="ak-btn ak-btn-ghost">
          <DownloadSimple size={17} aria-hidden="true" />
          Pricing guide (PDF)
        </a>
      </PageHeader>

      <section className="band pb-24 sm:pb-32">
        <div className="shell">
          <PricingTabs plans={plans} groups={GROUPS} />
        </div>
      </section>

      <section className="band-2 section">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal>
            <h2 className="ak-display h-lg">The parts that never change.</h2>
            <p className="mt-6 max-w-[40ch] text-[var(--fg-2)]">
              Still weighing it up? The money questions are answered plainly on the{" "}
              <Link href="/faq" className="text-link text-[var(--fg)]">FAQ</Link>.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {ALWAYS.map(([term, detail]) => (
                <div key={term} className="border-t border-[var(--rule-strong)] pt-5">
                  <dt className="ak-display text-[1.5rem] leading-tight">{term}</dt>
                  <dd className="mt-2 text-[var(--fg-2)]">{detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <Closing title="Not sure which plan?" body="Tell us what's costing you time or jobs. We'll say which plan fits, or whether you need one at all." />
    </>
  );
}
