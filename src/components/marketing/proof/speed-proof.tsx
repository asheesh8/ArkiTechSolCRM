import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/marketing/site/reveal";
import { AUDIT, SPEED_FLOOR } from "@/lib/pagespeed-audit";

const TERMS = [
  {
    term: "What we promise",
    detail: `Every site we build scores ${SPEED_FLOOR} or higher for mobile Performance on Google PageSpeed Insights at launch.`,
  },
  {
    term: "How it's measured",
    detail:
      "On the live site, on Google's own tool, on the mobile test. Not a local run, not desktop, not a screenshot we picked. You can run it yourself the day it goes live.",
  },
  {
    term: "If we miss it",
    detail: "We keep working until it clears, at no extra cost. No renegotiation, no scope conversation, no invoice for the fix.",
  },
  {
    term: "Afterwards",
    detail: "We re-run the audit after every build and every content change, so the score you launched with is the score you keep.",
  },
];

/** A gauge drawn the way Google draws it: an arc filled to the score. */
function Gauge({ label, value }: { label: string; value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <figure className="flex flex-col items-center text-center">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--rule)" strokeWidth="5" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="var(--lamp)"
            strokeWidth="5"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - value / 100)}
          />
        </svg>
        <span className="price absolute inset-0 flex items-center justify-center text-[1.9rem]">{value}</span>
      </div>
      <figcaption className="mt-3 text-sm text-[var(--fg-2)]">{label}</figcaption>
    </figure>
  );
}

/**
 * The speed promise and the proof side by side: anyone can claim a floor,
 * fewer can show they clear it on their own site.
 */
export function SpeedProof({ showShot = false }: { showShot?: boolean }) {
  return (
    <section className="band-2 section">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <Reveal>
            <h2 className="ak-display h-lg max-w-[15ch]">
              {SPEED_FLOOR}+ on Google, or we keep working for free.
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <div className="border border-[var(--rule)] bg-[var(--bg)] p-6 sm:p-8">
              <p className="text-sm text-[var(--dim)]">
                This site, {AUDIT.strategy.toLowerCase()}, measured {AUDIT.measuredOn}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {AUDIT.scores.map((s) => (
                  <Gauge key={s.label} label={s.label} value={s.value} />
                ))}
              </div>
              <a href={AUDIT.report} target="_blank" rel="noopener noreferrer" className="ak-arrow-link mt-7">
                Verify it on Google <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>

        {showShot ? (
          <Reveal delay={120}>
            {/* Google's own UI, unretouched. The one element allowed to break
                the palette: a screenshot recoloured to match would stop being
                evidence. */}
            <figure className="mt-12 border border-[var(--rule)] bg-white p-3">
              <Image
                src={AUDIT.shot}
                alt={`Google PageSpeed Insights results for ${AUDIT.url}: ${AUDIT.scores.map((s) => `${s.label} ${s.value}`).join(", ")}.`}
                width={1884}
                height={324}
                className="h-auto w-full"
              />
            </figure>
          </Reveal>
        ) : null}

        <dl className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {TERMS.map((t, i) => (
            <Reveal key={t.term} delay={i * 70}>
              <div className="border-t border-[var(--rule-strong)] pt-5">
                <dt className="ak-display text-[1.4rem] leading-tight">{t.term}</dt>
                <dd className="mt-2 text-[0.97rem] leading-relaxed text-[var(--fg-2)]">{t.detail}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
