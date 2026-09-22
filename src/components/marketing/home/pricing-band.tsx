import Link from "next/link";
import clsx from "clsx";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { PlanPrice } from "@/components/marketing/pricing/plan-price";
import { Reveal } from "@/components/marketing/site/reveal";
import { loadPlans } from "@/lib/marketing/plans";
import { plansIn, startingPrice, tidy } from "@/lib/marketing/plan-display";

/**
 * The website plans, on the home page, because the price is the first thing
 * a local owner wants to know and the lowest one on the market is ours.
 * Numbers come from getPricingPlans(), the same rows the pricing page prints.
 */
export async function PricingBand() {
  const all = await loadPlans();
  const plans = plansIn(all, "websites");
  const from = startingPrice("websites", all);

  return (
    <section id="pricing" className="band section">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <h2 className="ak-display h-xl">
              Websites {from.amount ? <>from {from.amount} a month.</> : "for every stage."}
            </h2>
            <p className="ak-lede mt-6 max-w-[54ch]">
              Published, because making people ask is a tactic and we&apos;d rather not use it. Month to month,
              and you keep the domain, the code, and the content if you ever leave.
            </p>
          </div>
          <Link href="/pricing" className="ak-arrow-link w-fit">
            Every plan and price <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-14 grid border-t border-[var(--rule)] sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p, i) => (
            <Reveal
              key={p.slug}
              delay={i * 80}
              className={clsx(
                "relative flex flex-col border-b border-[var(--rule)] py-9 sm:px-7 xl:border-b-0",
                i > 0 && "xl:border-l",
                i % 2 === 1 && "sm:border-l",
                p.featured && "bg-[var(--bg-2)]",
              )}
            >
              {p.featured ? (
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[var(--lamp)]" />
              ) : null}
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="ak-display text-[1.9rem] leading-none">{p.name}</h3>
                {p.featured ? <span className="text-xs font-medium text-[var(--accent-text)]">Most picked</span> : null}
              </div>
              <div className="mt-6">
                <PlanPrice plan={p} size="md" />
              </div>
              <p className="mt-5 text-[0.95rem] text-[var(--fg-2)]">{tidy(p.blurb).split(". ")[0].replace(/\.$/, "")}.</p>
              <ul className="mt-6 grid gap-2.5 text-[0.92rem]">
                {p.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check size={15} className="mt-1 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
                    <span>{tidy(f)}</span>
                  </li>
                ))}
                {p.features.length > 4 ? (
                  <li className="pl-[1.6rem] text-sm text-[var(--dim)]">
                    and {p.features.length - 4} more on the{" "}
                    <Link href="/pricing" className="text-link">pricing page</Link>
                  </li>
                ) : null}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ContactButton />
          <p className="text-sm text-[var(--dim)]">
            AI receptionist, automations, CRM and brand work are priced on the{" "}
            <Link href="/pricing" className="text-link text-[var(--fg)]">pricing page</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
