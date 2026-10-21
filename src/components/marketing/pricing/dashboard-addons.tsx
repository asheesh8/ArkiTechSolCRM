import { Plus } from "@phosphor-icons/react/dist/ssr";
import { money, plansIn, tidy, type Plan } from "@/lib/marketing/plan-display";

/**
 * The included dashboards, then the add-ons priced from the table. Shown on
 * /pricing and on the dashboards service page.
 */
export function DashboardAddons({ plans }: { plans: Plan[] }) {
  const addons = plansIn(plans, "addons");

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article className="flex flex-col border border-[var(--fg)] bg-[var(--bg)] p-7 sm:col-span-2 xl:col-span-1">
        <p className="text-sm text-[var(--dim)]">Included</p>
        <h3 className="ak-display mt-2 text-[1.75rem] leading-tight">Overview and CRM</h3>
        <p className="mt-4 text-[var(--fg-2)]">
          Every lead and client in one place, and the state of the business at a glance. Included with the Growth
          Partnership and with the Custom Website&apos;s monthly plan.
        </p>
      </article>
      {addons.map((a) => (
        <article key={a.slug} className="flex flex-col border border-[var(--rule)] bg-[var(--bg)] p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="ak-display text-[1.75rem] leading-tight">{a.name}</h3>
            {a.monthlyCents != null ? (
              <p className="shrink-0 text-sm text-[var(--dim)]">
                <Plus size={11} className="mr-1 inline" aria-hidden="true" />
                <span className="price text-[1.3rem] text-[var(--fg)]">{money(a.monthlyCents)}</span> a month
              </p>
            ) : null}
          </div>
          <p className="mt-4 text-[var(--fg-2)]">{tidy(a.blurb)}</p>
        </article>
      ))}
    </div>
  );
}
