import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { LocalStory } from "@/components/landing/local-story";
import { getServiceArea, SERVICE_AREAS } from "@/lib/service-areas";
import { services } from "@/lib/services-content";
import { SPEED_FLOOR } from "@/lib/pagespeed-audit";

export function generateStaticParams() {
  return SERVICE_AREAS.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = getServiceArea(slug);
  if (!area) return {};
  return {
    title: `${area.town} Website Design & Local SEO | ArkiTech Solutions`,
    description: `${area.headline}. Hand-coded sites, AI reception, and local SEO for ${area.town}, Vermont businesses — built in Burlington by people who live here.`,
  };
}

export default async function ServiceAreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = getServiceArea(slug);
  if (!area) notFound();

  const others = SERVICE_AREAS.filter((a) => a.slug !== area.slug);

  return (
    <main className="site min-h-screen">
      <SiteNav />

      <section className="band-ink site-section pt-[calc(var(--nav-h)+4rem)]">
        <div className="site-shell max-w-5xl">
          <Link href="/service-areas" className="arrow-link" style={{ color: "var(--dim)" }}>
            <span aria-hidden="true">←</span> All service areas
          </Link>

          <Reveal>
            <div className="mt-12">
              <p className="eyebrow">{area.town}, Vermont</p>
              <h1 className="d1">{area.headline}</h1>
              <div className="mt-10 max-w-[58ch] space-y-5">
                {area.intro.map((p) => (
                  <p key={p.slice(0, 32)} style={{ color: "var(--dim)", lineHeight: 1.8 }}>{p}</p>
                ))}
              </div>
            </div>
          </Reveal>

          {area.proof ? (
            <Reveal delay={90}>
              <div className="mt-12 border-l pl-6" style={{ borderColor: "var(--violet-lift)" }}>
                <p className="mono" style={{ color: "var(--violet-lift)", fontSize: "0.56rem" }}>
                  Locally
                </p>
                <p className="mt-3 max-w-[52ch]" style={{ lineHeight: 1.7 }}>
                  {area.proof.text}
                  {area.proof.href ? (
                    <>
                      {" "}
                      <a
                        href={area.proof.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4"
                      >
                        See the site ↗
                      </a>
                    </>
                  ) : null}
                </p>
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* Optional. Greyscaled and scrimmed to the same recipe as the hero, so a
          photograph reads as texture and local proof without dragging a second
          palette into a deliberately flat page. */}
      {area.photo ? (
        <section className="band-ink px-[var(--page-pad)] pb-[clamp(3rem,5vw,5rem)]">
          <figure className="site-shell max-w-5xl">
            <div className="relative aspect-[21/9] overflow-hidden border" style={{ borderColor: "var(--rule)" }}>
              <Image
                src={area.photo.src}
                alt={area.photo.alt}
                fill
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="object-cover"
                style={{ filter: "grayscale(0.6) contrast(1.05) brightness(0.78)" }}
              />
            </div>
            {area.photo.credit ? (
              <figcaption className="mono mt-3" style={{ color: "var(--dim)", fontSize: "0.52rem" }}>
                {area.photo.credit}
              </figcaption>
            ) : null}
          </figure>
        </section>
      ) : null}

      <section className="band-raised site-section">
        <div className="site-shell max-w-5xl">
          <Reveal>
            <p className="eyebrow">What we see in {area.town}</p>
            <h2 className="d2" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>
              The local version of the problem.
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <dl className="ledger mt-14">
              {area.local.map((item, i) => (
                <div
                  key={item.term}
                  className="grid gap-x-10 gap-y-2 border-b py-7 sm:grid-cols-[3.5rem_1fr_1.5fr]"
                  style={{ borderColor: "var(--rule)" }}
                >
                  <dt className="figure-index">{String(i + 1).padStart(2, "0")}</dt>
                  <dt className="d3" style={{ fontSize: "clamp(1.15rem, 1.7vw, 1.4rem)" }}>{item.term}</dt>
                  <dd className="text-sm" style={{ color: "var(--dim)", lineHeight: 1.7 }}>{item.detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-16">
              <p className="mono pb-4" style={{ color: "var(--dim)" }}>What we do for {area.town} businesses</p>
              <div className="ledger">
                {services.map((service, i) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="ledger-row"
                    style={{ gridTemplateColumns: "3.5rem 1fr auto" }}
                  >
                    <span className="figure-index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="d3" style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.45rem)" }}>{service.name}</span>
                    <span className="ledger-row__arrow" aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <LocalStory town={area.town} />

      <section className="band-violet site-section">
        <div className="site-shell">
          <Reveal>
            <p className="eyebrow">{area.town}</p>
            <h2 className="d2 max-w-[15ch]">Let&apos;s talk about your corner of it.</h2>
            <p className="lede mt-8 max-w-[46ch]">
              Twenty minutes, no obligation. Every site we build clears {SPEED_FLOOR}+ on Google
              PageSpeed or we keep working for free.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="tel:+18023103749" className="btn btn-solid">Call (802) 310-3749</a>
              <Link href="/pricing" className="btn btn-outline">See pricing</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band-ink site-section">
        <div className="site-shell max-w-5xl">
          <p className="eyebrow">Nearby</p>
          <div className="ledger">
            {others.map((other, i) => (
              <Link
                key={other.slug}
                href={`/service-areas/${other.slug}`}
                className="ledger-row"
                style={{ gridTemplateColumns: "3.5rem 1fr auto" }}
              >
                <span className="figure-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="d3" style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.45rem)" }}>{other.town}, VT</span>
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
