import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/lib/services-content";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { ArkiCompanion } from "@/components/mascot/arki-companion";

export const metadata: Metadata = {
  title: "Services — ArkiTech Solutions",
  description: "Websites, automations, AI reception, CRM, and local SEO for Vermont businesses.",
};

export default function ServicesIndex() {
  return (
    <main className="min-h-screen bg-[#0c0c18] text-white">
      <SiteNav />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-40">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">What we do</p>
            <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Five things, done properly.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/50">
              We don&apos;t sell a package and retrofit your business into it. Pick the piece you actually need — most
              people start with one and add the next when it earns its place.
            </p>
          </div>
          <ArkiCompanion mood="point" className="hidden h-40 w-40 lg:block" label="Arki, pointing at the service list" />
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {services.map((service, i) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-violet-400/40 hover:bg-white/[0.04]"
            >
              <span className="text-xs font-semibold tabular-nums text-violet-300/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">{service.name}</h2>
              <p className="mt-1 text-sm text-violet-200/70">{service.tagline}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/45">{service.summary}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition group-hover:text-white">
                Read more <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
