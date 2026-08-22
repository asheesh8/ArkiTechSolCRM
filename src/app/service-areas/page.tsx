import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { SERVICE_AREAS } from "@/lib/service-areas";

export const metadata: Metadata = {
  title: "Service Areas — Website Design & Local SEO Across Vermont",
  description:
    "Hand-built websites, AI reception, and local SEO for businesses in Burlington, Essex, Stowe, Winooski, Williston, Colchester, and South Burlington.",
};

export default function ServiceAreasPage() {
  return (
    <main className="site min-h-screen">
      <SiteNav />

      <section className="band-ink site-section pt-[calc(var(--nav-h)+5rem)]">
        <div className="site-shell">
          <Reveal>
            <p className="eyebrow">Where we work</p>
            <h1 className="d1 max-w-[14ch]">Vermont, and Burlington especially.</h1>
            <p className="lede mt-10 max-w-[52ch]">
              Burlington and Essex are home. We work across the state and we&apos;ll take work
              anywhere in the US — but the towns below are the ones we actually know, and it shows
              in the work.
            </p>
          </Reveal>

          <div className="ledger mt-20">
            {SERVICE_AREAS.map((area, i) => (
              <Reveal key={area.slug} delay={i * 60}>
                <Link href={`/service-areas/${area.slug}`} className="ledger-row">
                  <span className="figure-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="d3 block">{area.town}, VT</span>
                    <span
                      className="mt-2.5 block max-w-[56ch] text-sm"
                      style={{ color: "var(--dim)", lineHeight: 1.6 }}
                    >
                      {area.short}
                    </span>
                  </span>
                  <span className="ledger-row__arrow self-center text-lg" aria-hidden="true">↗</span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="mt-14 max-w-[56ch] border-t pt-8" style={{ borderColor: "var(--rule)", color: "var(--dim)", lineHeight: 1.75 }}>
              Not on the list? We work all over Vermont and beyond — the towns above just happen to
              be the ones we can write about honestly. Call{" "}
              <a href="tel:+18023103749" className="underline underline-offset-4">(802) 310-3749</a>{" "}
              and we&apos;ll tell you straight whether we&apos;re a good fit for yours.
            </p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
