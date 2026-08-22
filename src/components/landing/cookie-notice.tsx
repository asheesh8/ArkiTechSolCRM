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
          <div className="flex flex-col gap-3 border border-[rgba(236,233,227,0.18)] bg-[#0a0a0e] p-3.5 sm:gap-4 sm:p-5">
            <div className="flex items-start gap-3">
              {/* Icon and close button are desktop-only: on a phone they cost
                  width that pushes the copy onto extra lines, and "Decline"
                  already resolves the banner. */}
              <span className="hidden h-9 w-9 shrink-0 items-center justify-center border border-[rgba(236,233,227,0.16)] sm:flex">
                <Cookie className="h-4 w-4 text-[#b3a7ff]" aria-hidden="true" />
              </span>
              <p className="text-[0.72rem] leading-[1.5] text-[rgba(236,233,227,0.55)] sm:text-[0.8rem] sm:leading-6">
                We use cookies to run this site. With your permission we also measure how our
                advertising performs, which sets cookies from Meta. See our{" "}
                <Link href="/legal/privacy" className="text-[#b3a7ff] underline underline-offset-4 transition hover:text-[#ece9e3]">
                  Privacy Policy
                </Link>.
              </p>
              {/* Closing without choosing is a decline — never a silent grant. */}
              <button
                type="button"
                onClick={() => choose("denied")}
                aria-label="Decline advertising cookies"
                className="-mr-1 -mt-1 hidden h-7 w-7 shrink-0 items-center justify-center text-[rgba(236,233,227,0.56)] transition hover:text-[#ece9e3] sm:flex"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:pl-12">
              <button
                type="button"
                onClick={() => choose("granted")}
                className="btn btn-violet"
                style={{ minHeight: "2.4rem", padding: "0.4rem 1.1rem", fontSize: "0.6rem" }}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => choose("denied")}
                className="btn btn-outline" style={{ minHeight: "2.4rem", padding: "0.4rem 1.1rem", fontSize: "0.6rem", borderColor: "rgba(236,233,227,0.2)", color: "rgba(236,233,227,0.6)" }}
              >
                Decline
              </button>
              <Link
                href="/legal/terms"
                className="mono px-2 transition hover:text-[rgba(236,233,227,0.7)]" style={{ color: "rgba(236,233,227,0.56)", fontSize: "0.58rem" }}
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
