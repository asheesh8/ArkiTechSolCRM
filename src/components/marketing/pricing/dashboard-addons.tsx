import { money, plansIn, tidy, type Plan } from "@/lib/marketing/plan-display";

/**
 * The dashboard add-ons as one strip under the plans, not a second set of
 * cards: they extend a plan, they aren't an offer of their own. Shown on
 * /pricing and on the dashboards service page.
 */
export function DashboardAddons({ plans }: { plans: Plan[] }) {
  const addons = plansIn(plans, "addons");
  if (addons.length === 0) return null;
  const each = addons.find((a) => a.monthlyCents != null)?.monthlyCents;

  return (
    <div className="grid gap-6 border border-[var(--rule)] bg-[var(--bg)] p-6 sm:p-7 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
      <div>
        <h3 className="ak-display text-[1.45rem] leading-tight">Add a dashboard</h3>
        <p className="mt-2 text-sm text-[var(--dim)]">
          {each != null ? (
            <>
              <span className="price text-[1.15rem] text-[var(--fg)]">{money(each)}</span> a month each.{" "}
            </>
          ) : null}
          Overview and CRM come with every monthly plan.
        </p>
      </div>
      <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {addons.map((a) => (
          <li key={a.slug} className="text-[0.95rem]">
            <span className="block font-medium text-[var(--fg)]">{a.name}</span>
            <span className="mt-0.5 block text-[var(--fg-2)]">{tidy(a.blurb)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
