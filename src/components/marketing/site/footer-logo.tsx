"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { Mark } from "@/components/marketing/brand/mark";

/**
 * Footer lockup that opens the CRM on a triple click.
 *
 * Deliberately undiscoverable: it is how the team gets into the CRM from the
 * public site without a visible staff link. /dashboard sends anyone signed
 * out to /login. It is a button rather than a link on purpose, so the first
 * two clicks don't navigate away. Removing it locks the team out of their
 * own back door.
 */
export function FooterLogo() {
  const clicks = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

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
      className="inline-flex cursor-default select-none items-center gap-4 text-left focus-visible:outline-none"
    >
      <Mark className="h-14 w-14" />
      <span className="flex flex-col leading-none">
        <span className="ak-display text-[2.3rem]">ArkiTech</span>
        <span className="mt-1.5 ak-mono text-[0.62rem] tracking-[0.5em]">Solutions</span>
      </span>
    </button>
  );
}
