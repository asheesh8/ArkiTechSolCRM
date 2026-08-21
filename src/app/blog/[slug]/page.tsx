import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    <main className="min-h-screen bg-[#0c0c18] text-white">
      <SiteNav />

      <article className="mx-auto max-w-2xl px-6 pb-20 pt-40">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white">
          <ArrowLeft size={15} /> Blog
        </Link>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
          {service.name} · {post.readingTime}
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">{post.title}</h1>

        <div className="mt-10 space-y-6">
          {post.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-[17px] leading-[1.75] text-white/65">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Related service</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{service.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/50">{service.summary}</p>
          <Link
            href={`/services/${service.slug}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white"
          >
            See what&apos;s included <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-20 flex flex-col items-start gap-5">
          <p className="text-lg text-white/60">Want this looked at for your business?</p>
          <a
            href="tel:+18023103749"
            className="rounded-full bg-white px-7 py-3 text-sm font-semibold tracking-tight text-[#0c0c18] transition hover:bg-white/90 active:scale-[0.98]"
          >
            Get a quote
          </a>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
