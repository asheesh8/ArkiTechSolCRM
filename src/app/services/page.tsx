import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services-content";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Reveal } from "@/components/landing/reveal";

export const metadata: Metadata = {
  title: "Services — ArkiTech Solutions",
  description: "Websites, automations, AI reception, CRM, and local SEO for Vermont businesses.",
};

export default function ServicesIndex() {
  return (
    <main className="site min-h-screen">
      <SiteNav />

      <section className="band-ink site-section pt-[calc(var(--nav-h)+5rem)]">
        <div className="site-shell">
          <Reveal>
            <p className="eyebrow">What we do</p>
            <h1 className="d1 max-w-[12ch]">Five things, done properly.</h1>
            <p className="lede mt-10 max-w-[52ch]">
              We don&apos;t sell a package and retrofit your business into it. Pick the piece you
              actually need — most people start with one and add the next when it earns its place.
            </p>
          </Reveal>

          {/* A ledger, not a grid of cards. Five rows read as a considered
              practice; five rounded boxes read as a pricing table. */}
          <div className="ledger mt-20">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={i * 70}>
                <Link href={`/services/${service.slug}`} className="ledger-row">
                  <span className="figure-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="d3 block">{service.name}</span>
                    <span className="mono mt-2.5 block" style={{ color: "var(--violet-lift)" }}>
                      {service.tagline}
                    </span>
                    <span
                      className="mt-4 block max-w-[58ch] text-sm"
                      style={{ color: "var(--dim)", lineHeight: 1.65 }}
                    >
                      {service.summary}
                    </span>
                  </span>
                  <span className="ledger-row__arrow self-center text-lg" aria-hidden="true">↗</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
