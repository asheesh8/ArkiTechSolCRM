import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Plate } from "@/components/marketing/art/plate";
import type { PlateKey } from "@/lib/marketing/art";
import { PLATES } from "@/lib/marketing/art";

/**
 * The top of every inner page: title, one paragraph, optional actions, and
 * optionally the engraving that belongs to the page, set like a plate in a
 * book with its caption.
 */
export function PageHeader({
  title,
  lede,
  back,
  plate,
  children,
  wide = false,
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  back?: { href: string; label: string };
  plate?: PlateKey;
  children?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="band relative overflow-hidden pb-16 pt-[calc(var(--nav-h)+3.5rem)] sm:pb-20 sm:pt-[calc(var(--nav-h)+5rem)]">
      <div className={clsx("shell grid gap-12", plate && "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end lg:gap-16")}>
        <div>
          {back ? (
            <Link href={back.href} className="inline-flex items-center gap-2 text-sm text-[var(--dim)] hover:text-[var(--fg)]">
              <ArrowLeft size={14} aria-hidden="true" />
              {back.label}
            </Link>
          ) : null}
          <h1 className={clsx("ak-display h-hero", back && "mt-8", wide ? "max-w-[18ch]" : "max-w-[14ch]")}>{title}</h1>
          {lede ? <div className="ak-lede mt-7 max-w-[56ch]">{lede}</div> : null}
          {children ? <div className="mt-9 flex flex-wrap items-center gap-3">{children}</div> : null}
        </div>
        {plate ? (
          <figure className="hidden lg:block">
            <div className="flex aspect-[4/3] items-center justify-center border border-[var(--rule)] bg-[var(--bg-2)] p-8">
              <Plate name={plate} fill className="h-full w-full opacity-80" label={PLATES[plate].caption} />
            </div>
            <figcaption className="mt-3 text-sm text-[var(--dim)]">{PLATES[plate].caption}</figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
