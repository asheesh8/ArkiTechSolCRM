"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Minus } from "lucide-react";
import { formatMoney, PRICING_GROUPS, type PricingPlan } from "@/lib/pricing";
import { Reveal } from "./reveal";

type ComparisonValue = boolean | string;
type ComparisonRow = { label: string; values: [ComparisonValue, ComparisonValue] };

const WEBSITE_ROWS: ComparisonRow[] = [
  { label: "Custom website pages", values: ["Up to 10", "Up to 10"] },
  { label: "Mobile-first + desktop responsive", values: [true, true] },
  { label: "Google PageSpeed performance guarantee", values: [true, true] },
  { label: "Secure managed hosting", values: [true, true] },
  { label: "Maintenance and updates", values: [true, true] },
  { label: "Analytics admin dashboard", values: [true, true] },
  { label: "Monthly content edits", values: ["Limited", "Unlimited"] },
  { label: "Review management", values: [false, true] },
  { label: "Google Business Profile management", values: [false, true] },
];

const RECEPTIONIST_ROWS: ComparisonRow[] = [
  { label: "AI voice", values: ["Realistic", "Ultra-realistic"] },
  { label: "Natural interruption handling", values: [false, true] },
  { label: "Included inbound minutes", values: ["500 / month", "800 / month"] },
  { label: "Connected business systems", values: ["1 integration", "Up to 5"] },
  { label: "Additional usage", values: ["$0.35 / min", "$0.35 / min"] },
  { label: "Usage notice at 80%", values: [true, true] },
  { label: "Maintenance + business-day support", values: [true, true] },
];

function PriceLine({ plan }: { plan: PricingPlan }) {
  const { monthlyCents, onceCents, priceNote } = plan;
  const primary = onceCents != null ? formatMoney(onceCents) : monthlyCents != null ? formatMoney(monthlyCents) : null;
  const secondary = onceCents != null && monthlyCents != null
    ? `then ${formatMoney(monthlyCents)}/month`
    : onceCents != null ? "one time" : "/month";

  if (primary == null) {
    return <p className="d3" style={{ fontSize: "1.6rem" }}>{priceNote ?? "Custom proposal"}</p>;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-2.5">
      <span className="leading-none" style={{ fontStretch: "78%", fontWeight: 680, fontSize: "clamp(2.35rem, 4vw, 3.25rem)", letterSpacing: "-0.05em" }}>
        {primary}
      </span>
      <span className="mono" style={{ color: "var(--dim)", fontSize: "0.6rem" }}>{secondary}</span>
    </div>
  );
}

function Value({ value }: { value: ComparisonValue }) {
  if (value === true) return <Check aria-label="Included" size={18} strokeWidth={2.5} style={{ color: "var(--violet-lift)" }} />;
  if (value === false) return <Minus aria-label="Not included" size={18} style={{ color: "var(--dim)" }} />;
  return <span className="text-xs font-medium">{value}</span>;
}

function FeatureList({ features, marker = "plus" }: { features: string[]; marker?: "plus" | "check" }) {
  return (
    <ul className="mt-7 border-t" style={{ borderColor: "var(--rule)" }}>
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3.5 border-b py-3" style={{ borderColor: "var(--rule)" }}>
          {marker === "check" ? (
            <Check aria-hidden="true" className="mt-0.5 shrink-0" size={16} strokeWidth={2.5} style={{ color: "var(--violet-lift)" }} />
          ) : (
            <span aria-hidden="true" className="shrink-0" style={{ color: "var(--violet-lift)", fontSize: "0.8rem" }}>+</span>
          )}
          <span className="text-[0.86rem]" style={{ lineHeight: 1.5 }}>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function PlanCard({ plan, marker = "plus" }: { plan: PricingPlan; marker?: "plus" | "check" }) {
  return (
    <article className="flex h-full flex-col border p-7 sm:p-8" style={{ borderColor: "var(--rule)", background: plan.featured ? "var(--violet-deep)" : "var(--ink-raised)" }}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="d3" style={{ fontSize: "clamp(1.25rem, 2vw, 1.55rem)" }}>{plan.name}</h3>
        {plan.featured ? <span className="mono shrink-0 border px-2 py-1" style={{ borderColor: "var(--rule)", color: "var(--violet-lift)", fontSize: "0.5rem" }}>Most picked</span> : null}
      </div>
      <div className="mt-6"><PriceLine plan={plan} /></div>
      <p className="mt-5 text-sm" style={{ color: "var(--dim)", lineHeight: 1.65 }}>{plan.blurb}</p>
      <FeatureList features={plan.features} marker={marker} />
      <div className="mt-auto pt-8">
        <Link href="/#contact" className={`btn w-full ${plan.featured ? "btn-solid" : "btn-outline"}`}>Book a free call</Link>
      </div>
    </article>
  );
}

function TierComparison({ plans, rows }: { plans: [PricingPlan, PricingPlan]; rows: ComparisonRow[] }) {
  return (
    <div className="overflow-x-auto border" style={{ borderColor: "var(--rule)" }}>
      <table className="w-full min-w-[660px] border-collapse text-left">
        <thead>
          <tr style={{ background: "var(--ink-raised)" }}>
            <th className="w-[34%] border-r p-6 align-bottom" style={{ borderColor: "var(--rule)" }}><span className="eyebrow">Compare plans</span></th>
            {plans.map((plan) => (
              <th key={plan.slug} className="w-[33%] border-r p-6 align-top last:border-r-0" style={{ borderColor: "var(--rule)", background: plan.featured ? "var(--violet-deep)" : undefined }}>
                {plan.featured ? <span className="mono mb-3 inline-block" style={{ color: "var(--violet-lift)", fontSize: "0.5rem" }}>Most picked</span> : null}
                <h3 className="d3" style={{ fontSize: "1.2rem" }}>{plan.name}</h3>
                <div className="mt-4"><PriceLine plan={plan} /></div>
                <Link href="/#contact" className={`btn mt-6 w-full ${plan.featured ? "btn-solid" : "btn-outline"}`}>Book a free call</Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.label} style={{ background: index % 2 === 0 ? "var(--ink)" : "var(--ink-raised)" }}>
              <th className="border-r border-t px-6 py-4 text-sm font-medium" style={{ borderColor: "var(--rule)" }}>{row.label}</th>
              {row.values.map((value, valueIndex) => (
                <td key={`${row.label}-${valueIndex}`} className="border-r border-t px-4 py-4 text-center last:border-r-0" style={{ borderColor: "var(--rule)" }}>
                  <span className="inline-flex justify-center"><Value value={value} /></span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardGrid({ plans, marker = "plus" }: { plans: PricingPlan[]; marker?: "plus" | "check" }) {
  return (
    <div className="mt-12 grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))" }}>
      {plans.map((plan, index) => <Reveal key={plan.slug} delay={index * 70}><PlanCard plan={plan} marker={marker} /></Reveal>)}
    </div>
  );
}

function WebsitePricing({ plans }: { plans: PricingPlan[] }) {
  const outright = plans.find((plan) => plan.slug === "website-build");
  const managed = plans.find((plan) => plan.slug === "website-care");
  const growth = plans.find((plan) => plan.slug === "website-care-growth");
  const brand = plans.find((plan) => plan.slug === "website-custom");
  if (!outright || !managed || !growth || !brand) return <CardGrid plans={plans} />;
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]">
      <TierComparison plans={[managed, growth]} rows={WEBSITE_ROWS} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1"><PlanCard plan={outright} /><PlanCard plan={brand} /></div>
    </div>
  );
}

function ReceptionistPricing({ plans }: { plans: PricingPlan[] }) {
  const basic = plans.find((plan) => plan.slug === "receptionist-basic");
  const pro = plans.find((plan) => plan.slug === "receptionist-pro");
  const enterprise = plans.find((plan) => plan.slug === "receptionist-enterprise");
  if (!basic || !pro || !enterprise) return <CardGrid plans={plans} />;
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]">
      <TierComparison plans={[basic, pro]} rows={RECEPTIONIST_ROWS} />
      <PlanCard plan={enterprise} />
    </div>
  );
}

function ServiceDropdown({ plan }: { plan: PricingPlan }) {
  return (
    <details className="group border" style={{ borderColor: "var(--rule)", background: "var(--ink-raised)" }}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-7 [&::-webkit-details-marker]:hidden">
        <div>
          <p className="mono mb-3" style={{ color: "var(--violet-lift)", fontSize: "0.52rem" }}>Built to scope</p>
          <h3 className="d3" style={{ fontSize: "clamp(1.25rem, 2vw, 1.55rem)" }}>{plan.name}</h3>
          <p className="mt-3 max-w-[52ch] text-sm" style={{ color: "var(--dim)", lineHeight: 1.65 }}>{plan.blurb}</p>
        </div>
        <ChevronDown aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" size={22} />
      </summary>
      <div className="border-t px-7 pb-7" style={{ borderColor: "var(--rule)" }}>
        <FeatureList features={plan.features} marker="check" />
        <Link href="/#contact" className="btn btn-outline mt-7">Book a free call</Link>
      </div>
    </details>
  );
}

function SystemsPricing({ plans }: { plans: PricingPlan[] }) {
  return <div className="mt-12 grid gap-5">{plans.map((plan) => <ServiceDropdown key={plan.slug} plan={plan} />)}</div>;
}

export function PricingTabs({ plans }: { plans: PricingPlan[] }) {
  const [group, setGroup] = useState<string>(PRICING_GROUPS[0].key);
  const active = PRICING_GROUPS.find((item) => item.key === group) ?? PRICING_GROUPS[0];
  const shown = plans.filter((plan) => plan.group === group);
  return (
    <>
      <Reveal>
        <div className="flex flex-wrap gap-x-9 gap-y-3 border-b pb-5" style={{ borderColor: "var(--rule)" }} role="tablist">
          {PRICING_GROUPS.map((item) => (
            <button key={item.key} type="button" role="tab" aria-selected={item.key === group} onClick={() => setGroup(item.key)} className="nav-link" data-open={item.key === group || undefined}>{item.label}</button>
          ))}
        </div>
        <p className="lede mt-7 max-w-[52ch]">{active.blurb}</p>
      </Reveal>
      {group === "websites" ? <WebsitePricing plans={shown} /> : null}
      {group === "receptionist" ? <ReceptionistPricing plans={shown} /> : null}
      {group === "systems" ? <SystemsPricing plans={shown} /> : null}
      {group === "growth" ? <CardGrid plans={shown} marker="check" /> : null}
      {group === "advisory" ? <CardGrid plans={shown} marker="check" /> : null}
    </>
  );
}
