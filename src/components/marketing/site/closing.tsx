"use client";

import { Phone } from "@phosphor-icons/react";
import { useContact } from "@/components/marketing/site/contact-context";
import { SITE } from "@/lib/marketing/site";

/**
 * The bookend to the hero: the same view of Burlington, now with every light
 * on. The page opens at dusk and closes at night.
 */
export function Closing({
  title = "Let's build what's next.",
  body = "Bring us the business challenge, the half-formed idea, or the system that has stopped keeping up. We'll help shape the clearest way forward.",
}: {
  title?: string;
  body?: string;
}) {
  const { open } = useContact();
  return (
    <section className="band-night relative isolate overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/media/burlington-night.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-bottom"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(to right, rgba(12,17,24,0.94) 0%, rgba(12,17,24,0.8) 38%, rgba(12,17,24,0.25) 75%, rgba(12,17,24,0.1) 100%), linear-gradient(to bottom, rgba(12,17,24,0.7), rgba(12,17,24,0) 40%)" }}
      />
      <div className="shell flex min-h-[38rem] flex-col justify-center py-28 sm:min-h-[42rem]">
        <h2 className="ak-display h-hero max-w-[12ch]">{title}</h2>
        <p className="ak-lede mt-7 max-w-[46ch]">{body}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button type="button" onClick={open} className="ak-btn ak-btn-primary">
            Book a free call
          </button>
          <a href={SITE.phoneHref} className="ak-btn ak-btn-ghost">
            <Phone size={16} aria-hidden="true" />
            <span className="figure">{SITE.phone}</span>
          </a>
        </div>
        <p className="mt-5 text-sm text-[var(--dim)]">
          No obligation. Twenty minutes. We&apos;ll tell you if we&apos;re not the right fit.
        </p>
      </div>
    </section>
  );
}
