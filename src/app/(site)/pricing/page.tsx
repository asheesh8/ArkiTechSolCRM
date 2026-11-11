import Link from "next/link";
import { PageHeader } from "@/components/marketing/site/page-header";
import { PlanCard } from "@/components/marketing/pricing/plan-card";
import { DashboardAddons } from "@/components/marketing/pricing/dashboard-addons";
import { Closing } from "@/components/marketing/site/closing";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { GROUPS, loadPlans } from "@/lib/marketing/plans";
import { plansIn } from "@/lib/marketing/plan-display";
import { breadcrumbJsonLd, faqJsonLd, offerJsonLd, pageMetadata, SITE_URL } from "@/lib/marketing/seo";
import { pricingQuestions, priceWords } from "@/lib/marketing/faq";
import { OwnerTodo } from "@/components/marketing/site/owner-todo";
import { JsonLd } from "@/components/marketing/seo/json-ld";

export const metadata = pageMetadata({
  title: "Website, Google Business Profile & AEO Pricing | ArkiTech",
  description:
    "ArkiTech pricing: a $300/month Growth Partnership for 12 months, a $1,000 website plus $150/month, and a $3,000 AEO & GEO build. Dashboards are $50/month.",
  path: "/pricing",
});


// Prices live in the database and owners change them from CRM settings,
// which also revalidates this path directly.
export const revalidate = 300;

export default async function PricingPage() {
  const all = await loadPlans();
  const plans = plansIn(all, "plans");
  const [planGroup] = GROUPS;
  const w = priceWords(all);
  const questions = pricingQuestions(all);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Pricing", path: "/pricing" }]),
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "ArkiTech Solutions plans and dashboard add-ons",
            url: `${SITE_URL}/pricing`,
            itemListElement: all.filter((p) => p.active !== false).map(offerJsonLd),
          },
          faqJsonLd(questions),
        ]}
      />
      <PageHeader
        kicker="Website, Google Business Profile & AEO pricing"
        title="What it costs."
        lede={
          <p>
            ArkiTech has three plans: {w.partner} for 12 months (website, Google Business Profile, reviews), a {w.siteBuild} website with{" "}
            {w.siteMonthly} you can cancel anytime, and a {w.aeo}{" "}AEO (answer engine optimization) &amp; GEO (generative engine optimization)
            build. Dashboards are {w.addon} each.
          </p>
        }
      >
        <ContactButton />
      </PageHeader>

      <section className="band pb-20 sm:pb-24">
        <div className="shell">
          <h2 className="sr-only">{planGroup.label}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <PlanCard key={p.slug} plan={p} />
            ))}
          </div>
          <div id="dashboards" className="mt-4 scroll-mt-28">
            <DashboardAddons plans={all} />
          </div>
        </div>
      </section>

      <section className="band-2 section">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
          <div>
            <p className="ak-display h-lg">Questions about price</p>
            <p className="mt-6 max-w-[40ch] text-[var(--fg-2)]">
              More answers on the <Link href="/faq" className="text-link text-[var(--fg)]">FAQ</Link>, and the details of each plan on the{" "}
              <Link href="/services" className="text-link text-[var(--fg)]">services</Link> pages.
            </p>
          </div>
          <div className="grid gap-10">
            {questions.map((item) => (
              <div key={item.q} className="border-t border-[var(--rule-strong)] pt-6">
                <h2 className="ak-display text-[1.6rem] leading-tight">{item.q}</h2>
                <p className="mt-3 leading-relaxed text-[var(--fg-2)]">{item.a}</p>
                {item.todo ? <OwnerTodo>{item.todo}</OwnerTodo> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Closing title="Not sure which plan?" body="Tell us where your business is now. We'll say which plan fits, or whether you need one at all." />
    </>
  );
}
