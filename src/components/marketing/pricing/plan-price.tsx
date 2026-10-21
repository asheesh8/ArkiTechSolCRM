import { money as formatMoney, tidy, type Plan } from "@/lib/marketing/plan-display";

/** A plan's price, set the same way everywhere it appears. */
export function PlanPrice({ plan, size = "lg" }: { plan: Plan; size?: "lg" | "md" }) {
  const big = size === "lg" ? "text-[2.9rem]" : "text-[2.2rem]";
  // With a price shown, the note qualifies it ("12-month partnership");
  // without one, the note is the price line itself.
  const note = plan.priceNote ? <p className="mt-2 text-sm text-[var(--dim)]">{tidy(plan.priceNote)}</p> : null;

  if (plan.onceCents != null && plan.monthlyCents != null) {
    return (
      <div>
        <p className="flex items-baseline gap-2">
          <span className={`price leading-none ${big}`}>{formatMoney(plan.onceCents)}</span>
          <span className="text-sm text-[var(--dim)]">to build</span>
        </p>
        <p className="mt-2 text-sm text-[var(--dim)]">
          plus <span className="text-[var(--fg)] font-medium">{formatMoney(plan.monthlyCents)}</span> a month
        </p>
        {note}
      </div>
    );
  }
  if (plan.monthlyCents != null) {
    return (
      <div>
        <p className="flex items-baseline gap-2">
          <span className={`price leading-none ${big}`}>{formatMoney(plan.monthlyCents)}</span>
          <span className="text-sm text-[var(--dim)]">a month</span>
        </p>
        {note}
      </div>
    );
  }
  if (plan.onceCents != null) {
    return (
      <div>
        <p className="flex items-baseline gap-2">
          <span className={`price leading-none ${big}`}>{formatMoney(plan.onceCents)}</span>
          <span className="text-sm text-[var(--dim)]">one time</span>
        </p>
        {note}
      </div>
    );
  }
  return <p className="ak-display text-[2rem] leading-none">{plan.priceNote ?? "Custom proposal"}</p>;
}
