"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Mic } from "lucide-react";

// Paid social traffic is overwhelmingly mobile and rarely scrolls to the
// bottom, so the two actions follow them down the page — but get out of the
// way once the booking form itself is on screen.
export function StickyCta({ onBook, onHearDemo }: { onBook: () => void; onHearDemo: () => void }) {
  const [scrolledPast, setScrolledPast] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const booking = document.getElementById("book");
    if (!booking) return;

    const observer = new IntersectionObserver(
      ([entry]) => setBookingVisible(entry.isIntersecting),
      { rootMargin: "-25% 0px -25% 0px" },
    );
    observer.observe(booking);
    return () => observer.disconnect();
  }, []);

  const visible = scrolledPast && !bookingVisible;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: reduceMotion ? 0 : "120%", opacity: reduceMotion ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduceMotion ? 0 : "120%", opacity: reduceMotion ? 0 : 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
          style={{ background: "rgba(10,10,20,0.92)" }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-2.5">
            <button
              type="button"
              onClick={onHearDemo}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/80 transition hover:text-white active:scale-[0.98] motion-reduce:transition-none"
            >
              <Mic className="h-4 w-4" /> Hear it
            </button>
            <button
              type="button"
              onClick={onBook}
              className="flex-1 rounded-full px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none"
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 0 32px rgba(79,70,229,0.4)" }}
            >
              Book a call
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
