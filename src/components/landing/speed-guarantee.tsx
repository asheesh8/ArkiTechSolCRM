import { AUDIT, SPEED_FLOOR } from "@/lib/pagespeed-audit";
import { Reveal } from "./reveal";

/**
 * The speed guarantee, stated as terms rather than a slogan.
 *
 * A guarantee with no threshold, no measurement method, and no consequence is
 * marketing. This one names all three, and cites our own score — which is the
 * only reason we're in a position to offer it.
 */

const TERMS = [
  {
    term: "What we promise",
    detail: `Every site we build scores ${SPEED_FLOOR} or higher for mobile Performance on Google PageSpeed Insights at launch.`,
  },
  {
    term: "How it's measured",
    detail:
      "On the live site, on Google's own tool, on the mobile test — not a local run, not desktop, not a screenshot we picked. You can run it yourself the day it goes live.",
  },
  {
    term: "If we miss it",
    detail:
      "We keep working until it clears, at no extra cost. No renegotiation, no scope conversation, no invoice for the fix.",
  },
  {
    term: "Afterwards",
    detail:
      "We re-run the audit after every build and every content change, so the score you launched with is the score you keep.",
  },
];

export function SpeedGuarantee() {
  const performance = AUDIT.scores.find((s) => s.label === "Performance")?.value;

  return (
    <section className="band-raised site-section">
      <div className="site-shell">
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">The guarantee</p>
              <h2 className="d2 max-w-[14ch]">{SPEED_FLOOR}+ on Google, or we keep working for free.</h2>
            </div>

            {/* The proof sits next to the promise. Anyone can claim a floor;
                fewer can show they clear it on their own site. */}
            <a
              href={AUDIT.report}
              target="_blank"
              rel="noopener noreferrer"
              className="group shrink-0 border p-6 transition-colors duration-150 hover:border-[var(--violet-lift)]"
              style={{ borderColor: "var(--rule)" }}
            >
              <span className="mono block" style={{ color: "var(--dim)", fontSize: "0.56rem" }}>
                This site scores
              </span>
              <span
                className="mt-3 block leading-none"
                style={{ fontStretch: "78%", fontWeight: 680, fontSize: "clamp(3rem, 6vw, 4.5rem)", letterSpacing: "-0.05em" }}
              >
                {performance}
              </span>
              <span className="arrow-link mt-4" style={{ color: "var(--violet-lift)" }}>
                Verify it <span aria-hidden="true">↗</span>
              </span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={110}>
          <dl className="ledger mt-16">
            {TERMS.map((item, i) => (
              <div
                key={item.term}
                className="grid gap-x-10 gap-y-2 border-b py-7 sm:grid-cols-[3.5rem_1fr_1.6fr]"
                style={{ borderColor: "var(--rule)" }}
              >
                <dt className="figure-index">{String(i + 1).padStart(2, "0")}</dt>
                <dt className="d3" style={{ fontSize: "clamp(1.15rem, 1.7vw, 1.4rem)" }}>{item.term}</dt>
                <dd className="text-sm" style={{ color: "var(--dim)", lineHeight: 1.7 }}>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
