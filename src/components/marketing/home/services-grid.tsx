import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Plate } from "@/components/marketing/art/plate";
import { Reveal } from "@/components/marketing/site/reveal";
import { SERVICE_PLATE } from "@/lib/marketing/art";
import { services } from "@/lib/services-content";
import { loadPlans } from "@/lib/marketing/plans";
import { startingPrice } from "@/lib/marketing/plan-display";

/**
 * Five services, five cells, each carrying the nineteenth-century machine it
 * descends from. The grid is shaped to the plates: the wide elevation gets the
 * wide cell, the tall engine the tall one, and the lighthouse stands in the
 * one night cell.
 */
const LAYOUT: Record<string, { cell: string; art: string; tone: "paper" | "raised" | "night" }> = {
  websites: {
    cell: "lg:col-span-4",
    art: "h-44 lg:absolute lg:inset-y-7 lg:right-7 lg:h-auto lg:w-[46%]",
    tone: "raised",
  },
  automations: {
    cell: "lg:col-span-2 lg:row-span-2",
    art: "h-56 lg:h-auto lg:min-h-[16rem] lg:flex-1",
    tone: "paper",
  },
  "ai-receptionist": {
    cell: "lg:col-span-2",
    art: "h-28 lg:h-32",
    tone: "paper",
  },
  "crm-portals": {
    cell: "lg:col-span-2",
    art: "h-40 lg:h-44",
    tone: "raised",
  },
  "brand-seo": {
    cell: "lg:col-span-6 lg:min-h-[22rem]",
    art: "h-56 lg:absolute lg:inset-y-5 lg:right-16 lg:h-auto lg:w-[24%]",
    tone: "night",
  },
};

export async function ServicesGrid() {
  const plans = await loadPlans();
  return (
    <section id="services" className="band section">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 className="ak-display h-xl">Five things, done properly.</h2>
          <p className="ak-lede mt-6 max-w-[52ch]">
            We don&apos;t sell a package and retrofit your business into it. Pick the piece you need. Most
            people start with one and add the next when it earns its place.
          </p>
        </div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:auto-rows-[minmax(17rem,auto)] lg:grid-cols-6">
          {services.map((s, i) => {
            const l = LAYOUT[s.slug];
            const price = startingPrice(s.slug, plans);
            return (
              <Reveal as="li" key={s.slug} delay={i * 70} className={clsx(l.cell, s.slug === "brand-seo" && "sm:col-span-2")}>
                <Link
                  href={`/services/${s.slug}`}
                  className={clsx(
                    "group relative isolate flex h-full flex-col overflow-hidden border p-7 transition-colors duration-300 sm:p-8",
                    l.tone === "raised" && "border-transparent bg-[var(--bg-2)] hover:border-[var(--rule-strong)]",
                    l.tone === "paper" && "border-[var(--rule)] bg-[var(--bg)] hover:border-[var(--rule-strong)]",
                    l.tone === "night" && "band-night border-transparent",
                  )}
                >
                  <div className={clsx("relative z-10 max-w-[30rem]", (s.slug === "websites" || s.slug === "brand-seo") && "lg:max-w-[48%]")}>
                    <h3 className="ak-display h-md">{s.name}</h3>
                    <p className="mt-3 text-[var(--fg-2)]">{s.tagline}.</p>
                  </div>
                  <div className={clsx("relative my-7", l.art)}>
                    <Plate
                      fill
                      name={SERVICE_PLATE[s.slug]}
                      className="absolute inset-0 h-full w-full opacity-60 transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-90"
                    />
                  </div>
                  <div className="relative z-10 mt-auto flex items-end justify-between gap-6">
                    <p className="text-sm text-[var(--dim)]">
                      {price.lead}
                      {price.amount ? (
                        <>
                          {" "}
                          <span className="price text-[1.6rem] text-[var(--fg)]">{price.amount}</span>{" "}
                          {price.tail}
                        </>
                      ) : null}
                    </p>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--rule-strong)] transition-colors duration-300 group-hover:border-[var(--lamp)] group-hover:bg-[var(--lamp)] group-hover:text-[var(--ink)]">
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
