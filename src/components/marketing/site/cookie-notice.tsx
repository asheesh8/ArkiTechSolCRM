"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

/**
 * Consent copy is unchanged from the live site; only the styling moved.
 * Closing without choosing is a decline, never a silent grant.
 */
export function CookieNotice() {
  const [answered, setAnswered] = useState<boolean | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(() => setAnswered(readConsent() !== null), 1400);
    return () => window.clearTimeout(t);
  }, []);

  function choose(value: ConsentValue) {
    writeConsent(value);
    setAnswered(true);
  }

  return (
    <AnimatePresence>
      {answered === false ? (
        <motion.aside
          role="region"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-[75] sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[23rem]"
        >
          <div className="border border-[var(--rule)] bg-[var(--bg)] p-4 text-[var(--fg)] shadow-[var(--shadow)] sm:p-5">
            <p className="text-[0.84rem] leading-relaxed text-[var(--fg-2)]">
              We use cookies to run this site. With your permission we also measure how our advertising
              performs, which sets cookies from Meta. See our{" "}
              <Link href="/legal/privacy" className="text-link text-[var(--fg)]">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => choose("granted")} className="ak-btn ak-btn-primary ak-btn-sm">
                Accept
              </button>
              <button type="button" onClick={() => choose("denied")} className="ak-btn ak-btn-ghost ak-btn-sm">
                Decline
              </button>
              <Link href="/legal/terms" className="px-2 text-sm text-[var(--dim)] hover:text-[var(--fg)]">
                Terms
              </Link>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
