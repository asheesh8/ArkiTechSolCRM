"use client";

import { Reveal } from "./reveal";

/**
 * Closing call to action.
 *
 * Previously a mouse-tracking radial glow behind two counter-rotating dashed
 * circles, with gradient-filled type on a glowing gradient pill. All of it is
 * gone. What replaces it is a violet band, one very large condensed line, and
 * two square buttons — the page's loudest moment made entirely out of scale.
 */
export function ClosingSections({ onStartProject }: { onStartProject: () => void }) {
  return (
    <section className="band-violet site-section relative overflow-hidden">
      {/* A hairline grid, held well back. The only texture in the band. */}
      <div className="rule-grid pointer-events-none absolute inset-0" aria-hidden="true" style={{ opacity: 0.35 }} />

      <div className="site-shell relative">
        <Reveal>
          <p className="eyebrow">Ready when you are</p>
          <h2 className="d1 max-w-[13ch]">Let&apos;s build what&apos;s next.</h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 flex flex-col gap-10 border-t pt-10 lg:flex-row lg:items-end lg:justify-between" style={{ borderColor: "var(--rule)" }}>
            <p className="lede max-w-[44ch]">
              Bring us the business challenge, the half-formed idea, or the system that has stopped
              keeping up. We&apos;ll help shape the clearest way forward.
            </p>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={onStartProject} className="btn btn-solid">
                  Book a free call
                </button>
                <a href="tel:+18023103749" className="btn btn-outline">
                  Call (802) 310-3749
                </a>
              </div>
              {/* The reassurance belongs next to the button, not in the
                  paragraph above it — this is the moment someone hesitates. */}
              <p className="mono mt-4" style={{ color: "var(--dim)", fontSize: "0.56rem" }}>
                No obligation · 20 minutes · we&apos;ll tell you if we&apos;re not the right fit
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
