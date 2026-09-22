import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/marketing/site/page-header";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { Reveal } from "@/components/marketing/site/reveal";
import { Closing } from "@/components/marketing/site/closing";
import { Plate } from "@/components/marketing/art/plate";
import { SERVICE_PLATE } from "@/lib/marketing/art";
import { getServiceArea, SERVICE_AREAS } from "@/lib/service-areas";
import { services } from "@/lib/services-content";
import { SPEED_FLOOR } from "@/lib/pagespeed-audit";

export function generateStaticParams() {
  return SERVICE_AREAS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = getServiceArea(slug);
  if (!area) return {};
  return {
    title: `${area.town} Website Design & Local SEO | ArkiTech Solutions`,
    description: `${area.headline}. Hand-coded sites, AI reception, and local SEO for ${area.town}, Vermont businesses, built in Burlington by people who live here.`,
  };
}

const TEAM_FACTS: [string, string][] = [
  ["Based", "Burlington, Vermont"],
  ["Who builds it", "Ashish, start to finish"],
  ["Who you call", "Teibiroa, or Ashish directly"],
  ["Outsourced", "None of it"],
];

export default async function ServiceAreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = getServiceArea(slug);
  if (!area) notFound();
  const others = SERVICE_AREAS.filter((a) => a.slug !== area.slug);

  return (
    <>
      <PageHeader
        back={{ href: "/service-areas", label: "All service areas" }}
        title={area.headline}
        wide
        lede={
          <div className="grid gap-4">
            {area.intro.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        }
      >
        <ContactButton />
      </PageHeader>

      {area.proof ? (
        <section className="band pb-14">
          <div className="shell">
            <div className="max-w-[60ch] border-l-2 border-[var(--lamp)] pl-6">
              <p className="text-[1.08rem] leading-relaxed">
                {area.proof.text}
                {area.proof.href ? (
                  <>
                    {" "}
                    <a href={area.proof.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1">
                      See the site <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {area.photo ? (
        <section className="band pb-16 sm:pb-24">
          <figure className="shell">
            <div className="relative aspect-[16/9] overflow-hidden border border-[var(--rule)] sm:aspect-[21/9]">
              <Image src={area.photo.src} alt={area.photo.alt} fill sizes="(min-width: 1400px) 86rem, 100vw" className="object-cover" />
            </div>
            {area.photo.credit ? <figcaption className="mt-3 text-sm text-[var(--dim)]">{area.photo.credit}</figcaption> : null}
          </figure>
        </section>
      ) : null}

      <section className="band-2 section">
        <div className="shell">
          <h2 className="ak-display h-lg max-w-[18ch]">The local version of the problem.</h2>
          <dl className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {area.local.map((item, i) => (
              <Reveal key={item.term} delay={i * 80}>
                <div className="border-t border-[var(--rule-strong)] pt-5">
                  <dt className="ak-display text-[1.5rem] leading-tight">{item.term}</dt>
                  <dd className="mt-3 leading-relaxed text-[var(--fg-2)]">{item.detail}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="band section">
        <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="ak-display h-lg">Two people, both of them here.</h2>
            <div className="mt-7 grid max-w-[58ch] gap-5 leading-relaxed text-[var(--fg-2)]">
              <p>
                ArkiTech is Ashish Subedi and Teibiroa Ambo. Ashish studied at Champlain College in Burlington and writes every
                line of what we ship: no agency layer, no junior handed the project after you sign. Teibiroa handles the
                relationship, which in practice means you get a person on the phone rather than a ticket number.
              </p>
              <p>
                We both live here. That is not a marketing line about being &ldquo;locally owned.&rdquo; It means we know why{" "}
                {area.town} searches the way it does, we have driven the roads your customers drive, and if something breaks we
                are a phone call away in the same time zone, not a support queue in another one.
              </p>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5">
              {TEAM_FACTS.map(([t, d]) => (
                <div key={t}>
                  <dt className="text-sm text-[var(--dim)]">{t}</dt>
                  <dd className="mt-1 font-medium">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-sm text-[var(--dim)]">What we do for {area.town} businesses</h2>
            <ul className="mt-4 border-t border-[var(--rule)]">
              {services.map((s) => (
                <li key={s.slug} className="border-b border-[var(--rule)]">
                  <Link href={`/services/${s.slug}`} className="group flex items-center gap-5 py-4">
                    <Plate name={SERVICE_PLATE[s.slug]} fill className="h-12 w-16 shrink-0 opacity-70 group-hover:opacity-100" />
                    <span className="ak-display flex-1 text-[1.4rem] leading-tight">{s.name}</span>
                    <ArrowUpRight size={16} aria-hidden="true" className="text-[var(--dim)] group-hover:text-[var(--accent-text)]" />
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mt-12 text-sm text-[var(--dim)]">Nearby</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/service-areas/${o.slug}`} className="inline-block border border-[var(--rule-strong)] px-3.5 py-2 text-[0.95rem] hover:border-[var(--fg)]">
                    {o.town}, VT
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Closing
        title="Let's talk about your corner of it."
        body={`Twenty minutes, no obligation. Every site we build clears ${SPEED_FLOOR}+ on Google PageSpeed or we keep working for free.`}
      />
    </>
  );
}
