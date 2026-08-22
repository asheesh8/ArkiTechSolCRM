import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services-content";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Reveal } from "@/components/landing/reveal";

export const metadata: Metadata = {
  title: "Blog — ArkiTech Solutions",
  description: "Plain writing about websites, follow-up, reviews, and the systems behind a local business.",
};

export default function BlogIndex() {
  return (
    <main className="site min-h-screen">
      <SiteNav />

      <section className="band-ink site-section pt-[calc(var(--nav-h)+5rem)]">
        <div className="site-shell">
          <Reveal>
            <p className="eyebrow">Writing</p>
            <h1 className="d1 max-w-[13ch]">Things we keep having to explain.</h1>
          </Reveal>

          <div className="ledger mt-20">
            {services.map((service, i) => (
              <Reveal key={service.post.slug} delay={i * 70}>
                <Link
                  href={`/blog/${service.post.slug}`}
                  className="ledger-row"
                  style={{ gridTemplateColumns: "3.5rem 1fr auto" }}
                >
                  <span className="figure-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="mono block" style={{ color: "var(--violet-lift)" }}>{service.name}</span>
                    <span className="d3 mt-3 block" style={{ fontSize: "clamp(1.4rem, 2.2vw, 2rem)" }}>
                      {service.post.title}
                    </span>
                    <span
                      className="mt-3 block max-w-[62ch] text-sm"
                      style={{ color: "var(--dim)", lineHeight: 1.65 }}
                    >
                      {service.post.excerpt}
                    </span>
                    <span className="mono mt-5 block" style={{ color: "rgba(236,233,227,0.56)", fontSize: "0.6rem" }}>
                      {service.post.readingTime}
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
