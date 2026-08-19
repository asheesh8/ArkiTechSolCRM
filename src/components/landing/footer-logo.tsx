"use client";

import Image from "next/image";
import { useEffect, useRef, type MouseEvent } from "react";

/**
 * Footer wordmark that opens the internal dashboard on a triple click.
 *
 * Deliberately undiscoverable — it is how the team gets into the CRM from the public
 * site without a visible staff link. Moved here intact when the footer was extracted;
 * removing it locks the team out of their own back door.
 */
export function FooterLogo() {
  const clicks = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    clicks.current += 1;

    if (event.detail >= 3 || clicks.current >= 3) {
      if (timer.current) window.clearTimeout(timer.current);
      clicks.current = 0;
      timer.current = null;
      window.location.assign("/dashboard");
      return;
    }

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      clicks.current = 0;
      timer.current = null;
    }, 4_000);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="ArkiTech Solutions"
      className="relative block h-10 w-44 cursor-default select-none overflow-hidden rounded-xl border border-white/15 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <Image src="/arkitech-banner.png" alt="ArkiTech Solutions" fill sizes="176px" className="pointer-events-none object-cover object-center" draggable={false} />
    </button>
  );
}
