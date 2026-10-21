import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Plate } from "@/components/marketing/art/plate";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { Closing } from "@/components/marketing/site/closing";
import { PLATES, SERVICE_PLATE } from "@/lib/marketing/art";
import { getPost, servicesWithPosts } from "@/lib/services-content";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { AUTHOR, breadcrumbJsonLd, ORG_ID, pageMetadata, SITE_URL } from "@/lib/marketing/seo";

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function generateStaticParams() {
  return servicesWithPosts.map((s) => ({ slug: s.post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = getPost(slug);
  if (!found) return {};
  return pageMetadata({
    title: `${found.post.title} | ArkiTech`,
    description: found.post.description,
    path: `/blog/${found.post.slug}`,
    type: "article",
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = getPost(slug);
  if (!found) notFound();
  const { service, post } = found;
  const plate = SERVICE_PLATE[service.slug];
  const others = servicesWithPosts.filter((s) => s.post.slug !== post.slug);

  const path = `/blog/${post.slug}`;
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.published,
    dateModified: post.updated,
    author: AUTHOR,
    publisher: { "@id": ORG_ID },
    image: `${SITE_URL}/media/burlington-night.jpg`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    about: { "@type": "Service", name: service.name, url: `${SITE_URL}/services/${service.slug}` },
  };
  const crumbs = breadcrumbJsonLd([
    { name: "Blog", path: "/blog" },
    { name: post.title, path },
  ]);

  return (
    <>
      <JsonLd data={[article, crumbs]} />
      <article className="band pb-20 pt-[calc(var(--nav-h)+3.5rem)] sm:pt-[calc(var(--nav-h)+5rem)]">
        <div className="shell max-w-[46rem]">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--dim)] hover:text-[var(--fg)]">
            <ArrowLeft size={14} aria-hidden="true" /> All writing
          </Link>
          <p className="mt-10 text-sm text-[var(--dim)]">
            {service.name}, {post.readingTime}
          </p>
          <h1 className="ak-display h-xl mt-3">{post.title}</h1>
          <p className="ak-lede mt-6">{post.excerpt}</p>
          <p className="mt-6 text-sm text-[var(--dim)]">
            By{" "}
            <Link href="/about" className="text-link text-[var(--fg-2)]">
              Ashish Subedi
            </Link>
            , who builds every ArkiTech site · <time dateTime={post.published}>{longDate(post.published)}</time>
            {post.updated !== post.published ? (
              <>
                {" "}
                · Updated <time dateTime={post.updated}>{longDate(post.updated)}</time>
              </>
            ) : null}
          </p>
        </div>

        <figure className="shell mt-12 max-w-[60rem]">
          <div className="flex h-64 items-center justify-center border border-[var(--rule)] bg-[var(--bg-2)] p-10 sm:h-80">
            <Plate name={plate} fill className="h-full w-full opacity-80" label={PLATES[plate].caption} />
          </div>
          <figcaption className="mt-3 text-sm text-[var(--dim)]">{PLATES[plate].caption}</figcaption>
        </figure>

        <div className="shell mt-14 max-w-[46rem]">
          <div className="prose-ark first-letter:float-left first-letter:mr-2 first-letter:font-[family-name:var(--ak-display)] first-letter:text-[4.2rem] first-letter:leading-[0.85]">
            {post.body.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          <aside className="mt-16 border border-[var(--rule)] bg-[var(--bg-2)] p-8 sm:p-10">
            <p className="text-sm text-[var(--dim)]">Related service</p>
            <Link href={`/services/${service.slug}`} className="ak-display mt-2 inline-flex items-center gap-2 text-[1.9rem] leading-tight hover:text-[var(--accent-text)]">
              {service.name} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <p className="mt-3 leading-relaxed text-[var(--fg-2)]">{service.summary}</p>
            <div className="mt-7">
              <ContactButton />
            </div>
          </aside>

          <div className="mt-16">
            <h2 className="text-sm text-[var(--dim)]">Keep reading</h2>
            <ul className="mt-3 border-t border-[var(--rule)]">
              {others.map((o) => (
                <li key={o.post.slug} className="border-b border-[var(--rule)]">
                  <Link href={`/blog/${o.post.slug}`} className="group flex items-baseline justify-between gap-6 py-5">
                    <span className="ak-display text-[1.45rem] leading-tight group-hover:text-[var(--accent-text)]">{o.post.title}</span>
                    <span className="shrink-0 text-sm text-[var(--dim)]">{o.post.readingTime}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
      <Closing />
    </>
  );
}
