"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { Hands, Head, type Season } from "./arki-mascot";

/**
 * A button that Arki peeks over.
 *
 * Layering is what sells it:
 *   z-0   clip box ending exactly at the button's top edge — the head rises out of it
 *   z-10  the button itself, opaque, hiding everything below the rim
 *   z-20  the hands, unclipped, fingers curling over the front face of the button
 *
 * Wrappers own all static positioning (left/top). GSAP owns all transforms. Mixing the
 * two on one element makes the tween fight the Tailwind class, so they never share.
 */
export function PeekButton({
  children,
  onClick,
  className = "",
  side = "center",
  season = "none",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  side?: "left" | "center" | "right";
  season?: Season;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const head = useRef<SVGSVGElement>(null);
  const hands = useRef<SVGSVGElement>(null);
  const celebrate = useRef<(() => void) | null>(null);

  useEffect(() => {
    const headEl = head.current;
    const handsEl = hands.current;
    const rootEl = root.current;
    if (!rootEl || !headEl || !handsEl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shown = false;

    const ctx = gsap.context(() => {
      const handGroups = handsEl.querySelectorAll("[data-part^='hand-']");
      const eyes = headEl.querySelectorAll("[data-part^='eye-']");
      const antenna = headEl.querySelector("[data-part='antenna']");

      gsap.set(headEl, { yPercent: 108 });
      gsap.set(handGroups, { y: 30, opacity: 0 });

      let idle: gsap.core.Tween | null = null;
      let blink: number | null = null;

      function scheduleBlink() {
        blink = window.setTimeout(() => {
          gsap.to(eyes, { scaleY: 0.08, duration: 0.07, yoyo: true, repeat: 1, ease: "power2.inOut" });
          scheduleBlink();
        }, 2200 + Math.random() * 3200);
      }

      function show() {
        if (shown) return;
        shown = true;

        if (reduce) {
          gsap.set(headEl, { yPercent: 0 });
          gsap.set(handGroups, { y: 0, opacity: 1 });
          return;
        }

        gsap.timeline()
          // hands find the rim first, one then the other
          .to(handGroups, { y: 0, opacity: 1, duration: 0.34, stagger: 0.07, ease: "back.out(2.4)" })
          // head follows, overlapping — it's pulling itself up on those hands
          .to(headEl, { yPercent: 0, duration: 0.44, ease: "back.out(1.5)" }, "-=0.24")
          // antenna keeps swinging after the head stops
          .fromTo(antenna, { rotate: -16 }, { rotate: 0, duration: 0.9, ease: "elastic.out(1, 0.32)" }, "-=0.3")
          .add(() => {
            idle = gsap.to(headEl, { yPercent: -3.5, duration: 1.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
          });

        scheduleBlink();
      }

      function hide() {
        if (!shown) return;
        shown = false;
        idle?.kill();
        idle = null;
        if (blink) { window.clearTimeout(blink); blink = null; }

        if (reduce) {
          gsap.set(headEl, { yPercent: 108 });
          gsap.set(handGroups, { y: 30, opacity: 0 });
          return;
        }

        gsap.timeline()
          .to(headEl, { yPercent: 108, duration: 0.26, ease: "power2.in" })
          .to(handGroups, { y: 30, opacity: 0, duration: 0.2, stagger: 0.04, ease: "power2.in" }, "-=0.16");
      }

      // A quick hop on click — he reacts to the thing you just did.
      celebrate.current = () => {
        if (reduce || !shown) return;
        idle?.pause();
        gsap.timeline({ onComplete: () => idle?.resume() })
          .to(headEl, { yPercent: -16, duration: 0.18, ease: "power2.out" })
          .to(headEl, { yPercent: -3.5, duration: 0.42, ease: "bounce.out" })
          .fromTo(antenna, { rotate: 20 }, { rotate: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" }, 0);
      };

      rootEl.addEventListener("pointerenter", show);
      rootEl.addEventListener("pointerleave", hide);
      rootEl.addEventListener("focusin", show);
      rootEl.addEventListener("focusout", hide);

      return () => {
        rootEl.removeEventListener("pointerenter", show);
        rootEl.removeEventListener("pointerleave", hide);
        rootEl.removeEventListener("focusin", show);
        rootEl.removeEventListener("focusout", hide);
        if (blink) window.clearTimeout(blink);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  const align = side === "left" ? "left-7" : side === "right" ? "right-7" : "left-1/2 -translate-x-1/2";

  return (
    <span ref={root} className="relative inline-flex">
      {/* head, clipped to the rim so it can rise from behind the button */}
      <span className={`pointer-events-none absolute bottom-full z-0 h-[60px] w-[86px] overflow-hidden ${align}`}>
        <Head ref={head} season={season} className="h-[78px] w-[86px]" />
      </span>

      <button
        type="button"
        onClick={() => { celebrate.current?.(); onClick?.(); }}
        className={`relative z-10 rounded-full px-7 py-3 text-sm font-semibold tracking-tight transition active:scale-[0.98] ${className}`}
      >
        {children}
      </button>

      {/* hands, in front of the button face */}
      <span className={`pointer-events-none absolute -top-[6px] z-20 w-[108px] ${align}`}>
        <Hands ref={hands} className="w-[108px]" />
      </span>
    </span>
  );
}
