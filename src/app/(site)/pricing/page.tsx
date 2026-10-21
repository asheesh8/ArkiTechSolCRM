import Link from "next/link";
import { PageHeader } from "@/components/marketing/site/page-header";
import { PlanCard } from "@/components/marketing/pricing/plan-card";
import { DashboardAddons } from "@/components/marketing/pricing/dashboard-addons";
import { Reveal } from "@/components/marketing/site/reveal";
import { Closing } from "@/components/marketing/site/closing";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { GROUPS, loadPlans } from "@/lib/marketing/plans";
import { plansIn } from "@/lib/marketing/plan-display";
import { pageMetadata } from "@/lib/marketing/seo";

export const metadata = pageMetadata({
  title: "Website, Google Reviews & AI Search Pricing | ArkiTech",
  description:
    "What the Growth Partnership, a custom website, AI search optimization and each business dashboard cost, published in full. No hidden fees.",
  path: "/pricing",
});

const ALWAYS: [string, string][] = [
  ["Published in full", "Every price is on this page. Nothing is added on top that isn't printed here."],
  ["Clear terms", "The Growth Partnership runs for 12 months. The Custom Website's monthly plan is optional and you can cancel it anytime."],
  ["Dashboards as you need them", "Overview and CRM come included with the monthly plans. Add the others one at a time."],
  ["Real people", "Burlington, Vermont. You talk to whoever is building it."],
];

// Prices live in the database and owners change them from CRM settings,
// which also revalidates this path directly.
export const revalidate = 300;

export default async function PricingPage() {
  const all = await loadPlans();
  const plans = plansIn(all, "plans");
  const [planGroup, addonGroup] = GROUPS;
  return (
    <>
      <PageHeader
        kicker="Website, reviews and AI search pricing"
        title="What it costs."
        lede="Published, because making people ask is a tactic and we'd rather not use it. Three plans, and dashboards you add when you need them."
      >
        <ContactButton />
      </PageHeader>

      <section className="band pb-20 sm:pb-28">
        <div className="shell">
          <h2 className="sr-only">{planGroup.label}</h2>
          <p className="ak-lede max-w-[62ch]">{planGroup.blurb}</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <PlanCard key={p.slug} plan={p} />
            ))}
          </div>
        </div>
      </section>

      <section id="dashboards" className="band pb-24 sm:pb-32">
        <div className="shell">
          <h2 className="ak-display h-lg">{addonGroup.label}</h2>
          <p className="ak-lede mt-6 max-w-[62ch]">{addonGroup.blurb}</p>
          <div className="mt-10">
            <DashboardAddons plans={all} />
          </div>
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

      <Closing title="Not sure which plan?" body="Tell us where your business is now. We'll say which plan fits, or whether you need one at all." />
    </>
  );
}
