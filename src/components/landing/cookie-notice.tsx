"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "arkitech-cookie-notice";

// Stored in localStorage rather than a cookie so that dismissing the notice
// does not itself write the thing the notice is about.
function readDismissed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dismissed";
  } catch {
    // Private-mode Safari and hardened browser settings throw on access.
    return false;
  }
}

export function CookieNotice() {
  // `null` until the client has checked storage, so the server render and the
  // first client render agree on showing nothing.
  const [visible, setVisible] = useState<boolean | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setVisible(!readDismissed());
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      // Nothing to persist to — the notice simply returns on the next visit.
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label="Cookie notice"
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
                  width that pushes the copy onto extra lines, and "Got it"
                  already dismisses. */}
              <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-500/15 sm:flex">
                <Cookie className="h-4 w-4 text-violet-200" aria-hidden="true" />
              </span>
              <p className="text-[0.72rem] leading-[1.5] text-white/50 sm:text-[0.8rem] sm:leading-6">
                We use cookies and similar technologies to run this site, remember your preferences, and understand how it&apos;s used. See our{" "}
                <Link href="/legal/privacy" className="font-semibold text-violet-200/85 underline-offset-4 transition hover:text-violet-100 hover:underline">
                  Privacy Policy
                </Link>{" "}
                for details.
              </p>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss cookie notice"
                className="-mr-1 -mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/30 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 sm:flex"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:pl-12">
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-4 py-1.5 text-[11px] font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 sm:px-5 sm:py-2 sm:text-xs"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                Got it
              </button>
              <Link
                href="/legal/terms"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-1.5 text-[11px] font-semibold text-white/45 transition hover:border-white/20 hover:text-white sm:px-4 sm:py-2 sm:text-xs"
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
