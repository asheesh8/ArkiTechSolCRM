import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { getService, services } from "@/lib/services-content";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { ArkiCompanion } from "@/components/mascot/arki-companion";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return { title: `${service.name} — ArkiTech Solutions`, description: service.summary };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <main className="min-h-screen bg-[#0c0c18] text-white">
      <SiteNav />

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-40">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white">
          <ArrowLeft size={15} /> All services
        </Link>

        <div className="mt-8 flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">{service.tagline}</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">{service.name}</h1>
            <p className="mt-6 text-lg leading-relaxed text-white/55">{service.summary}</p>
          </div>
          <ArkiCompanion mood="wave" className="hidden h-36 w-36 shrink-0 sm:block" label={`Arki waving beside ${service.name}`} />
        </div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-2">
          {service.includes.map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
              <Check size={16} className="mt-0.5 shrink-0 text-violet-300" />
              <span className="text-sm leading-relaxed text-white/70">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* the blog demo that hangs off this service */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">From the blog</p>
          <Link href={`/blog/${service.post.slug}`} className="group mt-6 block max-w-3xl">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight transition group-hover:text-violet-200 sm:text-4xl">
              {service.post.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/50">{service.post.excerpt}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition group-hover:text-white">
              {service.post.readingTime}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Other services</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {others.map((other) => (
            <Link
              key={other.slug}
              href={`/services/${other.slug}`}
              className="rounded-full border border-white/12 px-5 py-2.5 text-sm text-white/60 transition hover:border-violet-400/40 hover:text-white"
            >
              {other.name}
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
