import { money as formatMoney, type Plan } from "@/lib/marketing/plan-display";

/** A plan's price, set the same way everywhere it appears. */
export function PlanPrice({ plan, size = "lg" }: { plan: Plan; size?: "lg" | "md" }) {
  const big = size === "lg" ? "text-[2.9rem]" : "text-[2.2rem]";

  if (plan.onceCents != null && plan.monthlyCents != null) {
    return (
      <div>
        <p className="flex items-baseline gap-2">
          <span className={`price leading-none ${big}`}>{formatMoney(plan.onceCents)}</span>
          <span className="text-sm text-[var(--dim)]">to build</span>
        </p>
        <p className="mt-2 text-sm text-[var(--dim)]">
          then <span className="text-[var(--fg)] font-medium">{formatMoney(plan.monthlyCents)}</span> a month
        </p>
      </div>
    );
  }
  if (plan.monthlyCents != null) {
    return (
      <p className="flex items-baseline gap-2">
        <span className={`price leading-none ${big}`}>{formatMoney(plan.monthlyCents)}</span>
        <span className="text-sm text-[var(--dim)]">a month</span>
      </p>
    );
  }
  if (plan.onceCents != null) {
    return (
      <p className="flex items-baseline gap-2">
        <span className={`price leading-none ${big}`}>{formatMoney(plan.onceCents)}</span>
        <span className="text-sm text-[var(--dim)]">one time</span>
      </p>
    );
  }
  return <p className="ak-display text-[2rem] leading-none">{plan.priceNote ?? "Custom proposal"}</p>;
}
