"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

export function CookieNotice() {
  // `null` until the client has checked storage, so the server render and the
  // first client render agree on showing nothing.
  const [answered, setAnswered] = useState<boolean | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setAnswered(readConsent() !== null);
  }, []);

  function choose(value: ConsentValue) {
    writeConsent(value);
    setAnswered(true);
  }

  return (
    <AnimatePresence>
      {answered === false && (
        <motion.aside
          role="region"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          // Sits above the chat launcher on phones and beside it on desktop, so
          // the two never overlap.
          className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[75] sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-sm"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#11111d]/95 p-3.5 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:gap-4 sm:p-5">
            <div className="flex items-start gap-3">
              {/* Icon and close button are desktop-only: on a phone they cost
                  width that pushes the copy onto extra lines, and "Decline"
                  already resolves the banner. */}
              <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-500/15 sm:flex">
                <Cookie className="h-4 w-4 text-violet-200" aria-hidden="true" />
              </span>
              <p className="text-[0.72rem] leading-[1.5] text-white/50 sm:text-[0.8rem] sm:leading-6">
                We use cookies to run this site. With your permission we also measure how our
                advertising performs, which sets cookies from Meta. See our{" "}
                <Link href="/legal/privacy" className="font-semibold text-violet-200/85 underline-offset-4 transition hover:text-violet-100 hover:underline">
                  Privacy Policy
                </Link>.
              </p>
              {/* Closing without choosing is a decline — never a silent grant. */}
              <button
                type="button"
                onClick={() => choose("denied")}
                aria-label="Decline advertising cookies"
                className="-mr-1 -mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/30 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 sm:flex"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:pl-12">
              <button
                type="button"
                onClick={() => choose("granted")}
                className="rounded-full px-4 py-1.5 text-[11px] font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 sm:px-5 sm:py-2 sm:text-xs"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => choose("denied")}
                className="rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-1.5 text-[11px] font-semibold text-white/45 transition hover:border-white/20 hover:text-white sm:px-4 sm:py-2 sm:text-xs"
              >
                Decline
              </button>
              <Link
                href="/legal/terms"
                className="rounded-full px-2 py-1.5 text-[11px] font-semibold text-white/30 transition hover:text-white/70 sm:text-xs"
              >
                Terms
              </Link>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
