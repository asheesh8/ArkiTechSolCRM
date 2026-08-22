import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, services } from "@/lib/services-content";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { PageSpeedScores } from "@/components/landing/pagespeed-scores";

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
    <main className="site min-h-screen">
      <SiteNav />

      <section className="band-ink site-section pt-[calc(var(--nav-h)+4rem)]">
        <div className="site-shell max-w-5xl">
          <Link href="/services" className="arrow-link" style={{ color: "var(--dim)" }}>
            <span aria-hidden="true">←</span> All services
          </Link>

          <Reveal>
            <div className="mt-12">
              <p className="eyebrow">{service.tagline}</p>
              <h1 className="d1">{service.name}</h1>
              <p className="lede mt-9 max-w-[52ch]">{service.summary}</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-16">
              <p className="mono pb-4" style={{ color: "var(--dim)" }}>What&apos;s included</p>
              <ul className="border-t" style={{ borderColor: "var(--rule)" }}>
                {service.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-5 border-b py-4"
                    style={{ borderColor: "var(--rule)" }}
                  >
                    <span aria-hidden="true" style={{ color: "var(--violet-lift)", fontSize: "0.7rem" }}>—</span>
                    <span className="text-[0.95rem]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Brand & Local SEO argues its case with a measurement, so it shows the
          measurement — our own scores, on the page that sells the audit. */}
      {service.slug === "brand-seo" ? <PageSpeedScores /> : null}

      {/* the blog demo that hangs off this service */}
      <section className="band-paper site-section">
        <div className="site-shell max-w-5xl">
          <Reveal>
            <p className="eyebrow">From the blog</p>
            <Link href={`/blog/${service.post.slug}`} className="group block max-w-3xl">
              <h2 className="d2" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>{service.post.title}</h2>
              <p className="mt-6 max-w-[58ch]" style={{ color: "var(--dim)", lineHeight: 1.7 }}>
                {service.post.excerpt}
              </p>
              <span className="arrow-link mt-8">
                {service.post.readingTime} <span aria-hidden="true">↗</span>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="band-ink site-section">
        <div className="site-shell max-w-5xl">
          <p className="eyebrow">Other services</p>
          <div className="ledger">
            {others.map((other, i) => (
              <Link
                key={other.slug}
                href={`/services/${other.slug}`}
                className="ledger-row"
                style={{ gridTemplateColumns: "3.5rem 1fr auto" }}
              >
                <span className="figure-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="d3" style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)" }}>{other.name}</span>
                <span className="ledger-row__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
