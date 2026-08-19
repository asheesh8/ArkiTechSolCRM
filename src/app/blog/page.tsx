import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/lib/services-content";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "Blog — ArkiTech Solutions",
  description: "Plain writing about websites, follow-up, reviews, and the systems behind a local business.",
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-[#0c0c18] text-white">
      <SiteNav />

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-40">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Writing</p>
        <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Things we keep having to explain.
        </h1>

        <div className="mt-16 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {services.map((service) => (
            <Link key={service.post.slug} href={`/blog/${service.post.slug}`} className="group flex flex-col gap-3 py-9 transition sm:flex-row sm:items-baseline sm:gap-10">
              <span className="w-40 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-violet-300/70">
                {service.name}
              </span>
              <span className="flex-1">
                <span className="block text-2xl font-semibold leading-snug tracking-tight transition group-hover:text-violet-200">
                  {service.post.title}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-white/45">{service.post.excerpt}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-xs text-white/35">
                  {service.post.readingTime}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
