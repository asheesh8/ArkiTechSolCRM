import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, services } from "@/lib/services-content";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = getPost(slug);
  if (!found) return {};
  return { title: `${found.post.title} — ArkiTech Solutions`, description: found.post.excerpt };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = getPost(slug);
  if (!found) notFound();
  const { service, post } = found;

  return (
    <main className="site min-h-screen">
      <SiteNav />

      <article className="band-ink site-section pt-[calc(var(--nav-h)+4rem)]">
        <div className="mx-auto max-w-2xl">
          <Link href="/blog" className="arrow-link" style={{ color: "var(--dim)" }}>
            <span aria-hidden="true">←</span> Blog
          </Link>

          <p className="eyebrow mt-12">{service.name} · {post.readingTime}</p>
          <h1 className="d2" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)" }}>{post.title}</h1>

          {/* Long-form measure and a looser leading than the rest of the site —
              this is the one place someone reads more than a paragraph. */}
          <div className="mt-14 space-y-7">
            {post.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-[1.06rem]" style={{ lineHeight: 1.78, color: "rgba(236,233,227,0.72)" }}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-20 border p-8" style={{ borderColor: "var(--rule)" }}>
            <p className="eyebrow">Related service</p>
            <h2 className="d3">{service.name}</h2>
            <p className="mt-4 text-sm" style={{ color: "var(--dim)", lineHeight: 1.7 }}>{service.summary}</p>
            <Link href={`/services/${service.slug}`} className="arrow-link mt-7" style={{ color: "var(--violet-lift)" }}>
              See what&apos;s included <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="mt-20 border-t pt-12" style={{ borderColor: "var(--rule)" }}>
            <p className="d3">Want this looked at for your business?</p>
            <Link href="/#contact" className="btn btn-solid mt-8">Book a free call</Link>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
