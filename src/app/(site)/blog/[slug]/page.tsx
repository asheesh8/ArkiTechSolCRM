import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Plate } from "@/components/marketing/art/plate";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { Closing } from "@/components/marketing/site/closing";
import { PLATES, SERVICE_PLATE } from "@/lib/marketing/art";
import { getPost, services } from "@/lib/services-content";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = getPost(slug);
  if (!found) return {};
  return { title: `${found.post.title} | ArkiTech Solutions`, description: found.post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = getPost(slug);
  if (!found) notFound();
  const { service, post } = found;
  const plate = SERVICE_PLATE[service.slug];
  const others = services.filter((s) => s.post.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: "ArkiTech Solutions" },
    publisher: { "@type": "Organization", name: "ArkiTech Solutions" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
