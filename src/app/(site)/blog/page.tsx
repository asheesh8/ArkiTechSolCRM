import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/marketing/site/page-header";
import { Plate } from "@/components/marketing/art/plate";
import { Reveal } from "@/components/marketing/site/reveal";
import { Closing } from "@/components/marketing/site/closing";
import { SERVICE_PLATE } from "@/lib/marketing/art";
import { services } from "@/lib/services-content";

export const metadata: Metadata = {
  title: "Blog | ArkiTech Solutions",
  description: "Plain writing about websites, follow-up, reviews, and the systems behind a local business.",
};

export default function BlogIndex() {
  const [lead, ...rest] = services;
  return (
    <>
      <PageHeader title="Things we keep having to explain." lede="Plain writing about websites, follow-up, reviews, and the systems behind a local business." />

      <section className="band pb-24 sm:pb-32">
        <div className="shell">
          <Reveal>
            <Link
              href={`/blog/${lead.post.slug}`}
              className="group grid gap-10 border-y border-[var(--rule)] py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16"
            >
              <div>
                <p className="text-sm text-[var(--dim)]">
                  {lead.name}, {lead.post.readingTime}
                </p>
                <h2 className="ak-display h-xl mt-4 max-w-[16ch] group-hover:text-[var(--accent-text)]">{lead.post.title}</h2>
                <p className="ak-lede mt-6 max-w-[50ch]">{lead.post.excerpt}</p>
                <span className="ak-arrow-link mt-8">
                  Read it <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </div>
              <div className="flex h-72 items-center justify-center bg-[var(--bg-2)] p-10">
                <Plate name={SERVICE_PLATE[lead.slug]} fill className="h-full w-full opacity-75" />
              </div>
            </Link>
          </Reveal>

          <ul className="mt-4 grid gap-x-10 sm:grid-cols-2">
            {rest.map((s, i) => (
              <Reveal as="li" key={s.post.slug} delay={i * 60} className="border-b border-[var(--rule)]">
                <Link href={`/blog/${s.post.slug}`} className="group flex h-full gap-6 py-10">
                  <div className="hidden h-24 w-24 shrink-0 items-center justify-center bg-[var(--bg-2)] p-3 sm:flex">
                    <Plate name={SERVICE_PLATE[s.slug]} fill className="h-full w-full opacity-70" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--dim)]">
                      {s.name}, {s.post.readingTime}
                    </p>
                    <h2 className="ak-display mt-2 text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight group-hover:text-[var(--accent-text)]">{s.post.title}</h2>
                    <p className="mt-3 leading-relaxed text-[var(--fg-2)]">{s.post.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <Closing />
    </>
  );
}
