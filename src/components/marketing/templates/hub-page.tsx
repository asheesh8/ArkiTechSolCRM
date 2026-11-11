import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { PageHeader } from "@/components/marketing/site/page-header";
import { Closing } from "@/components/marketing/site/closing";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { Related } from "@/components/marketing/templates/blocks";
import type { Link as PageLink } from "@/lib/content/types";
import { breadcrumbJsonLd, ORG_ID, SITE_URL } from "@/lib/marketing/seo";

/**
 * A section front: one answer-first paragraph, then the pages in it. Only
 * published pages are listed.
 */
export function HubPage({
  path,
  name,
  kicker,
  title,
  lede,
  items,
  related = [],
}: {
  path: string;
  /** Breadcrumb name. */
  name: string;
  kicker: string;
  title: string;
  /** 40-60 words answering what this section is about. */
  lede: string;
  items: { href: string; title: string; summary: string }[];
  related?: PageLink[];
}) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name, path }]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            url: `${SITE_URL}${path}`,
            name: title,
            about: { "@id": ORG_ID },
            hasPart: items.map((i) => ({ "@type": "WebPage", url: `${SITE_URL}${i.href}`, name: i.title })),
          },
        ]}
      />
      <PageHeader kicker={kicker} title={title} lede={lede} wide backdrop>
        <ContactButton />
      </PageHeader>
      <section className="band pb-24 sm:pb-32">
        <div className="shell grid gap-16">
          <ul className="grid gap-4 md:grid-cols-2">
            {items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  className="group flex h-full flex-col border border-[var(--rule)] p-7 transition-colors hover:border-[var(--rule-strong)] sm:p-8"
                >
                  <h2 className="ak-display text-[1.6rem] leading-tight group-hover:text-[var(--accent-text)]">{i.title}</h2>
                  <p className="mt-3 flex-1 leading-relaxed text-[var(--fg-2)]">{i.summary}</p>
                  <span className="ak-arrow-link mt-6 w-fit">
                    Read the guide <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Related links={related} />
        </div>
      </section>
      <Closing />
    </>
  );
}
