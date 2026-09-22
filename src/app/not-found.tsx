import Link from "next/link";
import { Plate } from "@/components/marketing/art/plate";
import { SiteFrame } from "@/components/marketing/site/site-frame";

export default function NotFound() {
  return (
    <SiteFrame>
      <section className="band flex min-h-[80dvh] items-center pb-20 pt-[calc(var(--nav-h)+4rem)]">
        <div className="shell grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm text-[var(--dim)]">404</p>
            <h1 className="ak-display h-hero mt-3 max-w-[12ch]">This page isn&apos;t on the chart.</h1>
            <p className="ak-lede mt-6 max-w-[44ch]">
              The link may be old, or the page moved in the rebuild. Everything we do is one click from here.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/" className="ak-btn ak-btn-primary">Back to the home page</Link>
              <Link href="/services" className="ak-btn ak-btn-ghost">All services</Link>
            </div>
          </div>
          <Plate name="chart-lake" className="mx-auto hidden w-full max-w-md opacity-40 lg:block" />
        </div>
      </section>
    </SiteFrame>
  );
}
