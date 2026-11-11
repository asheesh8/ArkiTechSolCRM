"use client";

import clsx from "clsx";
import { Check, X } from "@phosphor-icons/react";
import { useContact } from "@/components/marketing/site/contact-context";
import { PlanPrice } from "@/components/marketing/pricing/plan-price";
import { tidy, type Plan } from "@/lib/marketing/plan-display";
import { CTA_LABEL } from "@/lib/marketing/site";
import { OFFER_TERMS } from "@/lib/marketing/offers";

export function PlanCard({ plan }: { plan: Plan }) {
  const { open } = useContact();
  const scoped = plan.features.length === 0;
  const notIncluded = OFFER_TERMS[plan.slug]?.notIncluded ?? [];

  return (
    <article
      className={clsx(
        "relative flex h-full flex-col border p-7 sm:p-8",
        plan.featured ? "border-[var(--fg)] bg-[var(--bg)]" : "border-[var(--rule)] bg-[var(--bg)]",
      )}
    >
      {plan.featured ? (
        <span className="absolute -top-3 left-7 bg-[var(--lamp)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] sm:left-8">
          Most picked
        </span>
      ) : null}
      <h3 className="ak-display text-[1.75rem] leading-tight">{plan.name}</h3>
      <div className="mt-5">
        <PlanPrice plan={plan} />
      </div>
      <p className="mt-5 text-[var(--fg-2)]">{tidy(plan.blurb)}</p>

      {scoped ? null : (
        <ul className="mt-6 grid gap-2.5 border-t border-[var(--rule)] pt-6 text-[0.95rem]">
          {plan.features.map((f) => (
            <li key={f} className="flex gap-2.5">
              <Check size={15} className="mt-1 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
              <span>{tidy(f)}</span>
            </li>
          ))}
        </ul>
      )}
      {notIncluded.length ? (
        <div className="mt-5 text-[0.95rem] text-[var(--dim)]">
          <p className="text-xs font-medium uppercase tracking-[0.12em]">Not included</p>
          <ul className="mt-2.5 grid gap-2.5">
            {notIncluded.map((f) => (
              <li key={f} className="flex gap-2.5">
                <X size={15} className="mt-1 shrink-0" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="min-h-8 flex-1" />
      <button type="button" onClick={open} className={clsx("ak-btn w-full", plan.featured ? "ak-btn-primary" : "ak-btn-ghost")}>
        {CTA_LABEL}
      </button>
    </article>
  );
}
