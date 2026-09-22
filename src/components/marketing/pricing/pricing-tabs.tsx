"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PlanCard } from "@/components/marketing/pricing/plan-card";
import { plansIn, type Group, type GroupKey, type Plan } from "@/lib/marketing/plan-display";

/**
 * Five groups, one visible at a time. The group lives in the URL hash
 * (/pricing#receptionist) so a service page can link straight to its plans.
 */
export function PricingTabs({ plans: allPlans, groups }: { plans: Plan[]; groups: Group[] }) {
  const [active, setActive] = useState<GroupKey>("websites");
  const reduce = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace("#", "") as GroupKey;
      if (groups.some((g) => g.key === h)) setActive(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [groups]);

  function choose(key: GroupKey) {
    setActive(key);
    history.replaceState(null, "", `#${key}`);
  }

  function onKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + groups.length) % groups.length;
    choose(groups[n].key);
    tabs.current[n]?.focus();
  }

  const group = groups.find((g) => g.key === active)!;
  const plans = plansIn(allPlans, active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Pricing groups"
        className="-mx-[var(--page-pad)] flex gap-1 overflow-x-auto border-b border-[var(--rule)] px-[var(--page-pad)] [scrollbar-width:none] sm:mx-0 sm:px-0"
      >
        {groups.map((g, i) => {
          const on = g.key === active;
          return (
            <button
              key={g.key}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`tab-${g.key}`}
              aria-selected={on}
              aria-controls={`panel-${g.key}`}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(g.key)}
              onKeyDown={(e) => onKey(e, i)}
              className={clsx(
                "relative shrink-0 px-4 py-3.5 text-[0.98rem] transition-colors",
                on ? "text-[var(--fg)]" : "text-[var(--dim)] hover:text-[var(--fg)]",
              )}
            >
              {g.label}
              {on ? (
                <motion.span
                  layoutId="pricing-tab"
                  className="absolute inset-x-3 -bottom-px h-[2px] bg-[var(--lamp)]"
                  transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          id={`panel-${active}`}
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -6 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="sr-only">{group.label}</h2>
          <p className="ak-lede mt-10 max-w-[62ch]">{group.blurb}</p>
          <div
            className={clsx(
              "mt-10 grid gap-4",
              plans.length >= 4 && "md:grid-cols-2 xl:grid-cols-4",
              plans.length === 3 && "md:grid-cols-3",
              plans.length === 2 && "md:grid-cols-2 lg:max-w-[60rem]",
            )}
          >
            {plans.map((p) => (
              <PlanCard key={p.slug} plan={p} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
