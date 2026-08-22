"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney, PRICING_GROUPS, type PricingPlan } from "@/lib/pricing";
import { Reveal } from "./reveal";

/**
 * Tabs the pricing table by product rather than stacking every plan.
 *
 * The services aren't comparable — a website is a subscription, a CRM build is
 * a scoped project — so one flat grid would either flatten the custom work into
 * a fixed price or make the productised work look negotiable.
 */

function PriceLine({ plan }: { plan: PricingPlan }) {
  const { monthlyCents, onceCents, priceNote } = plan;

  // A plan can be recurring, one-off, or both (a build fee plus upkeep).
  const primary =
    onceCents != null ? formatMoney(onceCents) : monthlyCents != null ? formatMoney(monthlyCents) : null;
  const secondary =
    onceCents != null && monthlyCents != null
      ? `then ${formatMoney(monthlyCents)}/month`
      : onceCents != null
        ? "one time"
        : "/month";

  if (primary == null) {
    return <p className="d3" style={{ fontSize: "1.6rem" }}>Let&apos;s scope it</p>;
  }

  return (
    <div className="flex items-baseline gap-2.5">
      {priceNote ? (
        <span className="mono" style={{ color: "var(--dim)", fontSize: "0.6rem" }}>{priceNote}</span>
      ) : null}
      <span
        className="leading-none"
        style={{ fontStretch: "78%", fontWeight: 680, fontSize: "clamp(2.5rem, 4.4vw, 3.4rem)", letterSpacing: "-0.05em" }}
      >
        {primary}
      </span>
      <span className="mono" style={{ color: "var(--dim)", fontSize: "0.6rem" }}>{secondary}</span>
    </div>
  );
}

export function PricingTabs({ plans }: { plans: PricingPlan[] }) {
  const [group, setGroup] = useState<string>(PRICING_GROUPS[0].key);
  const active = PRICING_GROUPS.find((g) => g.key === group) ?? PRICING_GROUPS[0];
  const shown = plans.filter((p) => p.group === group);

  return (
    <>
      <Reveal>
        <div className="flex flex-wrap gap-x-9 gap-y-3 border-b pb-5" style={{ borderColor: "var(--rule)" }} role="tablist">
          {PRICING_GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              role="tab"
              aria-selected={g.key === group}
              onClick={() => setGroup(g.key)}
              className="nav-link"
              data-open={g.key === group || undefined}
            >
              {g.label}
            </button>
          ))}
        </div>
        <p className="lede mt-7 max-w-[52ch]">{active.blurb}</p>
      </Reveal>

      <div
        className="mt-12 grid gap-px border"
        style={{
          borderColor: "var(--rule)",
          background: "var(--rule)",
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 17rem), 1fr))`,
        }}
      >
        {shown.map((plan, i) => (
          <Reveal key={plan.slug} delay={i * 70}>
            <article
              className="flex h-full flex-col p-7 sm:p-8"
              style={{ background: plan.featured ? "var(--violet-deep)" : "var(--ink-raised)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="d3" style={{ fontSize: "clamp(1.3rem, 2vw, 1.6rem)" }}>{plan.name}</h3>
                {plan.featured ? (
                  <span
                    className="mono shrink-0 border px-2 py-1"
                    style={{ borderColor: "var(--rule)", color: "var(--violet-lift)", fontSize: "0.5rem" }}
                  >
                    Most picked
                  </span>
                ) : null}
              </div>

              <div className="mt-6">
                <PriceLine plan={plan} />
              </div>

              <p className="mt-5 text-sm" style={{ color: "var(--dim)", lineHeight: 1.65 }}>{plan.blurb}</p>

              <ul className="mt-7 border-t" style={{ borderColor: "var(--rule)" }}>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-baseline gap-3.5 border-b py-3" style={{ borderColor: "var(--rule)" }}>
                    <span aria-hidden="true" style={{ color: "var(--violet-lift)", fontSize: "0.7rem" }}>—</span>
                    <span className="text-[0.86rem]" style={{ lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/#contact"
                className={`btn mt-8 w-full ${plan.featured ? "btn-solid" : "btn-outline"}`}
              >
                Book a call
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </>
  );
}
