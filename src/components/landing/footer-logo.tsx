"use client";

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
      className="block cursor-default select-none text-left focus-visible:outline-none"
    >
      <span
        className="block leading-none"
        style={{ fontStretch: "78%", fontWeight: 700, fontSize: "1.6rem", letterSpacing: "-0.038em" }}
      >
        ArkiTech<span style={{ color: "var(--violet-lift)" }}> Solutions</span>
      </span>
    </button>
  );
}
