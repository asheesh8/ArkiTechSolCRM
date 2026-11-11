import Link from "next/link";
import { PlanCard } from "@/components/marketing/pricing/plan-card";
import { plansIn, type Plan } from "@/lib/marketing/plan-display";

/** The three plans as cards, for town and industry pages. */
export function PlanStrip({ plans, title = "What it costs" }: { plans: Plan[]; title?: string }) {
  const rows = plansIn(plans, "plans");
  if (!rows.length) return null;
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="ak-display h-md">{title}</h2>
        <Link href="/pricing" className="ak-arrow-link">
          Every plan and price <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="mt-8 grid gap-4">
        {rows.map((p) => (
          <PlanCard key={p.slug} plan={p} />
        ))}
      </div>
    </section>
  );
}
