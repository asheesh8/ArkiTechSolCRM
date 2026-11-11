import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { Closing } from "@/components/marketing/site/closing";
import { OwnerTodo } from "@/components/marketing/site/owner-todo";
import { QuickAnswer, Related, Sections } from "@/components/marketing/templates/blocks";
import type { ContentPage } from "@/lib/content/types";
import { breadcrumbJsonLd, ORG_ID, SITE_URL } from "@/lib/marketing/seo";
import { workImage, type Work } from "@/lib/marketing/work";

export type CaseStudyData = ContentPage & {
  work: Work;
  /** The industry as a reader would say it. */
  industryLabel: string;
  /**
   * A live PageSpeed Insights mobile score with the date it was measured.
   * Leave unset until it has actually been measured; the page then shows
   * no score at all.
   */
  pagespeed?: { score: number; measured: string; report: string };
  /** Only with the client's written permission. */
  quote?: { text: string; name: string; role?: string };
};

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * One client site: who, where, what we built, how fast it is (measured, with a
 * date), what the client said (with permission), and the live link. Links on
 * to the client's town and industry pages.
 */
export function CaseStudyPage({ page }: { page: CaseStudyData }) {
  const w = page.work;
  const facts: [string, React.ReactNode][] = [
    ["Client", w.name],
    ["Industry", page.industryLabel],
    ...(w.where ? ([["Location", w.where]] as [string, React.ReactNode][]) : []),
    [
      "Live site",
      <a key="live" href={w.url} className="text-link text-[var(--fg)]" rel="noopener" target="_blank">
        {w.host}
      </a>,
    ],
  ];
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: page.h1,
            description: page.description,
            url: `${SITE_URL}${page.path}`,
            datePublished: page.published,
            dateModified: page.updated,
            author: { "@id": ORG_ID },
            publisher: { "@id": ORG_ID },
            image: `${SITE_URL}${workImage(w.slug, "cover")}`,
            about: { "@type": "Organization", name: w.name, url: w.url },
          },
          breadcrumbJsonLd([
            { name: "Work", path: "/work" },
            { name: w.name, path: page.path },
          ]),
        ]}
      />
      <article className="band pb-20 pt-[calc(var(--nav-h)+3.5rem)] sm:pt-[calc(var(--nav-h)+5rem)]">
        <div className="shell max-w-[52rem]">
          <Link href="/work" className="inline-flex items-center gap-2 text-sm text-[var(--dim)] hover:text-[var(--fg)]">
            <ArrowLeft size={14} aria-hidden="true" /> All work
          </Link>
          {page.kicker ? <p className="meta mt-10 uppercase tracking-[0.16em]">{page.kicker}</p> : null}
          <h1 className={`ak-display h-xl ${page.kicker ? "mt-4" : "mt-10"}`}>{page.h1}</h1>
          {w.ownerTodo ? <OwnerTodo>{w.ownerTodo.replace(/^TODO\(owner\):\s*/, "")}</OwnerTodo> : null}
          <div className="mt-10">
            <QuickAnswer text={page.quickAnswer} />
          </div>

          <dl className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {facts.map(([term, value]) => (
              <div key={term} className="border-t border-[var(--rule)] pt-4">
                <dt className="text-sm text-[var(--dim)]">{term}</dt>
                <dd className="mt-1 text-[1.1rem]">{value}</dd>
              </div>
            ))}
          </dl>

          <figure className="mt-12">
            <Image
              src={workImage(w.slug, "cover")}
              width={1200}
              height={750}
              alt={`The ${w.name} homepage as it looks on a laptop.`}
              sizes="(min-width: 880px) 832px, 100vw"
              className="h-auto w-full border border-[var(--rule)]"
            />
            <figcaption className="mt-3 text-sm text-[var(--dim)]">A capture of the live site, not a mockup.</figcaption>
          </figure>

          <div className="mt-14">
            <Sections sections={page.sections} />
          </div>

          <section className="mt-14">
            <h2 className="ak-display h-md">How fast is the site on a phone?</h2>
            {page.pagespeed ? (
              <p className="mt-5 leading-relaxed text-[var(--fg-2)]">
                Google PageSpeed Insights scored the live site {page.pagespeed.score} for mobile Performance on{" "}
                {longDate(page.pagespeed.measured)}.{" "}
                <a href={page.pagespeed.report} className="text-link text-[var(--fg)]" rel="noopener" target="_blank">
                  See the report
                </a>
                .
              </p>
            ) : (
              <>
                <p className="mt-5 leading-relaxed text-[var(--fg-2)]">
                  You can check it yourself: run the live site through{" "}
                  <a href="https://pagespeed.web.dev/" className="text-link text-[var(--fg)]" rel="noopener" target="_blank">
                    Google PageSpeed Insights
                  </a>
                  .
                </p>
                <OwnerTodo>measure {w.host} on PageSpeed Insights (mobile) and add the score, date and report link.</OwnerTodo>
              </>
            )}
          </section>

          {page.quote ? (
            <figure className="mt-14 border-l-2 border-[var(--lamp)] pl-6">
              <blockquote className="ak-display text-[1.6rem] leading-snug">&ldquo;{page.quote.text}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm text-[var(--dim)]">
                {page.quote.name}
                {page.quote.role ? `, ${page.quote.role}` : ""}
              </figcaption>
            </figure>
          ) : (
            <OwnerTodo>add a quote from {w.name}, only with their written permission.</OwnerTodo>
          )}

          <a href={w.url} className="ak-btn ak-btn-ghost mt-14" rel="noopener" target="_blank">
            Visit {w.host} <ArrowUpRight size={15} aria-hidden="true" />
          </a>

          <div className="mt-16">
            <Related links={page.related} />
          </div>
        </div>
      </article>
      <Closing />
    </>
  );
}
