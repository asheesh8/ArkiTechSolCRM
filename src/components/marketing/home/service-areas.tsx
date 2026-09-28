import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/marketing/site/reveal";
import { SERVICE_AREAS } from "@/lib/service-areas";

/**
 * The towns we write about, as one compact grid instead of a map and a long
 * list. Burlington, home base and first in SERVICE_AREAS, takes the tall
 * night cell; the other six sit beside it in two rows on a laptop.
 */
export function ServiceAreas({ hubLink = true }: { hubLink?: boolean }) {
  return (
    <section id="service-areas" className="band-2 section">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 className="ak-display h-xl">Burlington out, in every direction.</h2>
          <p className="ak-lede mt-6 max-w-[46ch]">Pick a town to see what we actually know about doing business there.</p>
        </div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_AREAS.map((area, i) => {
            const home = i === 0;
            return (
              <Reveal as="li" key={area.slug} delay={i * 60} className={clsx(home && "sm:col-span-2 lg:col-span-1 lg:row-span-2")}>
                <Link
                  href={`/service-areas/${area.slug}`}
                  className={clsx(
                    "group flex h-full flex-col justify-between gap-2 border px-5 py-4 transition-colors duration-300 sm:gap-5 sm:p-7",
                    home ? "band-night border-transparent" : "border-[var(--rule)] bg-[var(--bg)] hover:border-[var(--rule-strong)]",
                  )}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className={clsx("ak-display", home ? "h-md" : "text-[1.35rem] leading-tight sm:text-[1.55rem]")}>{area.town}</span>
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className="mt-1.5 shrink-0 text-[var(--dim)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]"
                    />
                  </span>
                  <span className={clsx("leading-relaxed text-[var(--fg-2)]", home ? "max-w-[24ch]" : "text-sm")}>{area.short}</span>
                </Link>
              </Reveal>
            );
          })}
        </ul>

        {hubLink && (
          <Link href="/service-areas" className="ak-arrow-link mt-10">
            All service areas <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </section>
  );
}
