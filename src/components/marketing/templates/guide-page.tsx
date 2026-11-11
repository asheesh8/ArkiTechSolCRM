import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { Closing } from "@/components/marketing/site/closing";
import { Byline, DraftNotice, FaqBlock, plainText, QuickAnswer, Related, Sections } from "@/components/marketing/templates/blocks";
import type { ContentPage } from "@/lib/content/types";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/marketing/seo";

/** Title, description, canonical and social preview for any content page; drafts are noindex. */
export function contentMetadata(page: ContentPage): Metadata {
  return {
    ...pageMetadata({ title: page.title, description: page.description, path: page.path, type: "article" }),
    ...(page.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * Guides, comparisons and industry pages: answer first, then question H2s,
 * FAQ and related links. `parent` is the hub the breadcrumb runs through;
 * `children` slots in page-type extras (plans, client examples) above the FAQ.
 */
export function GuidePage({
  page,
  parent,
  about,
  schema = [],
  children,
}: {
  page: ContentPage;
  parent: { name: string; path: string };
  /** What the article is about, for schema. */
  about?: string;
  /** Extra JSON-LD nodes (a Service for an industry page, say). */
  schema?: object[];
  children?: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            headline: page.h1,
            description: page.description,
            path: page.path,
            published: page.published,
            updated: page.updated,
            about,
          }),
          breadcrumbJsonLd([parent, { name: page.h1, path: page.path }]),
          ...(page.faqs?.length ? [faqJsonLd(page.faqs.map((f) => ({ q: f.q, a: plainText(f.a) })))] : []),
          ...schema,
        ]}
      />
      <article className="band pb-20 pt-[calc(var(--nav-h)+3.5rem)] sm:pt-[calc(var(--nav-h)+5rem)]">
        <div className="shell max-w-[48rem]">
          <Link href={parent.path} className="inline-flex items-center gap-2 text-sm text-[var(--dim)] hover:text-[var(--fg)]">
            <ArrowLeft size={14} aria-hidden="true" /> {parent.name}
          </Link>
          {page.kicker ? <p className="meta mt-10 uppercase tracking-[0.16em]">{page.kicker}</p> : null}
          <h1 className={`ak-display h-xl ${page.kicker ? "mt-4" : "mt-10"}`}>{page.h1}</h1>
          <div className="mt-6">
            <Byline published={page.published} updated={page.updated} />
          </div>
          {page.noindex ? (
            <div className="mt-8">
              <DraftNotice />
            </div>
          ) : null}
          <div className="mt-10">
            <QuickAnswer text={page.quickAnswer} />
          </div>
          <div className="mt-14">
            <Sections sections={page.sections} />
          </div>
          {children ? <div className="mt-14">{children}</div> : null}
          {page.faqs?.length ? (
            <div className="mt-16">
              <FaqBlock items={page.faqs} />
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
