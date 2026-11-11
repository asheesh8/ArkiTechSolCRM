import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { Closing } from "@/components/marketing/site/closing";
import { OwnerTodo } from "@/components/marketing/site/owner-todo";
import { FaqBlock, plainText, QuickAnswer, Related, Rich, Sections } from "@/components/marketing/templates/blocks";
import { PlanStrip } from "@/components/marketing/templates/plan-strip";
import type { ContentPage } from "@/lib/content/types";
import { caseStudyLinks, clientsInTown } from "@/lib/content/clients";
import type { Plan } from "@/lib/marketing/plan-display";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/marketing/seo";
import { AREA_SERVED } from "@/lib/marketing/site";

export type TownPageData = ContentPage & {
  town: string;
  /** What we see businesses in this town needing. Must be specific to the town. */
  local: { term: string; detail: string }[];
  /** A real connection to the town, if we have one. */
  proof?: string;
  /** Licensed for commercial use; credit filled in where the licence asks. */
  photo?: { src: string; width: number; height: number; alt: string; credit?: string };
  /** Owner note for local detail still missing. Development only. */
  todo?: string;
};

/**
 * One town: why a website works differently there, real clients nearby, the
 * plans, a town FAQ, and links to the industries common there. The Service
 * schema narrows areaServed to the town.
 */
export function TownPage({ page, plans }: { page: TownPageData; plans: Plan[] }) {
  const nearby = clientsInTown(page.slug);
  const city = { "@type": "City", name: `${page.town}, Vermont`, containedInPlace: { "@type": "State", name: AREA_SERVED.state } };
  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            name: `Website design in ${page.town}, Vermont`,
            description: page.description,
            path: page.path,
            offers: plans.filter((p) => p.group === "plans"),
            areaServed: city,
          }),
          breadcrumbJsonLd([
            { name: "Service areas", path: "/service-areas" },
            { name: page.town, path: page.path },
          ]),
          ...(page.faqs?.length ? [faqJsonLd(page.faqs.map((f) => ({ q: f.q, a: plainText(f.a) })))] : []),
        ]}
      />
      <article className="band pb-20 pt-[calc(var(--nav-h)+3.5rem)] sm:pt-[calc(var(--nav-h)+5rem)]">
        <div className="shell max-w-[48rem]">
          <Link href="/service-areas" className="inline-flex items-center gap-2 text-sm text-[var(--dim)] hover:text-[var(--fg)]">
            <ArrowLeft size={14} aria-hidden="true" /> Service areas
          </Link>
          {page.kicker ? <p className="meta mt-10 uppercase tracking-[0.16em]">{page.kicker}</p> : null}
          <h1 className={`ak-display h-xl ${page.kicker ? "mt-4" : "mt-10"}`}>{page.h1}</h1>
          <div className="mt-10">
            <QuickAnswer text={page.quickAnswer} />
          </div>
          {page.todo ? <OwnerTodo>{page.todo}</OwnerTodo> : null}
          {page.photo ? (
            <figure className="mt-12">
              <Image
                src={page.photo.src}
                width={page.photo.width}
                height={page.photo.height}
                alt={page.photo.alt}
                sizes="(min-width: 800px) 768px, 100vw"
                className="h-auto w-full border border-[var(--rule)]"
              />
              <figcaption className="mt-3 text-sm text-[var(--dim)]">{page.photo.credit ?? page.photo.alt}</figcaption>
            </figure>
          ) : null}

          <section className="mt-14">
            <h2 className="ak-display h-md">What do {page.town} businesses need from a website?</h2>
            <dl className="mt-6 grid gap-6">
              {page.local.map((item) => (
                <div key={item.term} className="border-t border-[var(--rule)] pt-5">
                  <dt className="ak-display text-[1.35rem] leading-tight">{item.term}</dt>
                  <dd className="mt-2 leading-relaxed text-[var(--fg-2)]">
                    <Rich text={item.detail} />
                  </dd>
                </div>
              ))}
            </dl>
            {page.proof ? (
              <p className="mt-8 leading-relaxed text-[var(--fg-2)]">
                <Rich text={page.proof} />
              </p>
            ) : null}
          </section>

          <div className="mt-14">
            <Sections sections={page.sections} />
          </div>
          {nearby.length ? (
            <div className="mt-14">
              <Related title={`Clients in and around ${page.town}`} links={caseStudyLinks(nearby)} />
            </div>
          ) : null}
          <div className="mt-14">
            <PlanStrip plans={plans} title={`What a website in ${page.town} costs`} />
          </div>
          {page.faqs?.length ? (
            <div className="mt-16">
              <FaqBlock items={page.faqs} title={`Questions from ${page.town} businesses`} />
            </div>
          ) : null}
          <div className="mt-16">
            <Related links={page.related} />
          </div>
        </div>
      </article>
      <Closing />
    </>
  );
}
