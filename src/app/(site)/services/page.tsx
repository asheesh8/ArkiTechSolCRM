import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/marketing/site/page-header";
import { Plate } from "@/components/marketing/art/plate";
import { Reveal } from "@/components/marketing/site/reveal";
import { Closing } from "@/components/marketing/site/closing";
import { SERVICE_PLATE } from "@/lib/marketing/art";
import { services } from "@/lib/services-content";
import { loadPlans } from "@/lib/marketing/plans";
import { startingPrice } from "@/lib/marketing/plan-display";

export const metadata: Metadata = {
  title: "Services | ArkiTech Solutions",
  description: "Websites, automations, AI reception, CRM, and local SEO for Vermont businesses.",
};

// Prices are read from the database, so this page revalidates like /pricing.
export const revalidate = 300;

export default async function ServicesIndex() {
  const plans = await loadPlans();
  return (
    <>
      <PageHeader
        title="Five things, done properly."
        lede="We don't sell a package and retrofit your business into it. Pick the piece you actually need. Most people start with one and add the next when it earns its place."
      />

      <section className="band pb-24 sm:pb-32">
        <div className="shell">
          <ol className="border-t border-[var(--rule)]">
            {services.map((s, i) => {
              const price = startingPrice(s.slug, plans);
              return (
                <Reveal as="li" key={s.slug} delay={i * 40} className="border-b border-[var(--rule)]">
                  <Link
                    href={`/services/${s.slug}`}
                    className="group grid gap-8 py-12 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12 lg:grid-cols-[18rem_minmax(0,1fr)_auto] lg:py-14"
                  >
                    <div className="flex h-40 items-center justify-center bg-[var(--bg-2)] p-6 transition-colors duration-300 group-hover:bg-[var(--bg-3)] md:h-44">
                      <Plate name={SERVICE_PLATE[s.slug]} fill className="h-full w-full opacity-75 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="max-w-[62ch]">
                      <h2 className="ak-display h-lg">{s.name}</h2>
                      <p className="mt-2 font-medium text-[var(--accent-text)]">{s.tagline}</p>
                      <p className="mt-5 leading-relaxed text-[var(--fg-2)]">{s.summary}</p>
                      <ul className="mt-6 grid gap-2 text-[0.95rem] sm:grid-cols-2">
                        {s.includes.slice(0, 4).map((item) => (
                          <li key={item} className="flex gap-2.5">
                            <Check size={15} className="mt-1 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-6 text-sm text-[var(--dim)]">
                        {price.lead}
                        {price.amount ? (
                          <>
                            {" "}
                            <span className="price text-[1.45rem] text-[var(--fg)]">{price.amount}</span> {price.tail}
                          </>
                        ) : null}
                      </p>
                    </div>
                    <span className="hidden h-12 w-12 items-center justify-center self-start border border-[var(--rule-strong)] transition-colors duration-300 group-hover:border-[var(--lamp)] group-hover:bg-[var(--lamp)] group-hover:text-[var(--ink)] lg:inline-flex">
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      <Closing />
    </>
  );
}
