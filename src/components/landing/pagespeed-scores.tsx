import { Reveal } from "./reveal";

/**
 * Our own PageSpeed Insights scores, shown as the demo of the audit work.
 *
 * These are REAL MEASURED NUMBERS and must stay that way — the whole argument
 * of the section is that you don't have to take our word for it, which is worth
 * nothing if the figures are aspirational. Re-run the audit after every deploy
 * of arkitech-sol.com and update both the scores and `measuredOn`:
 *
 *   https://pagespeed.web.dev/analysis?url=https://arkitech-sol.com
 *
 * The CRM runs the same audit against client sites through /api/pagespeed,
 * which needs GOOGLE_PAGESPEED_API_KEY set.
 */
const AUDIT = {
  url: "arkitech-sol.com",
  strategy: "Mobile",
  measuredOn: "21 August 2026",
  report: "https://pagespeed.web.dev/analysis/https-arkitech-sol-com/76dri7u07s?form_factor=mobile",
  scores: [
    { label: "Performance", value: 92 },
    { label: "Accessibility", value: 97 },
    { label: "Best Practices", value: 100 },
    { label: "SEO", value: 100 },
  ],
} as const;

export function PageSpeedScores() {
  return (
    <section className="band-raised site-section">
      <div className="site-shell max-w-5xl">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Our own scorecard</p>
              <h2 className="d2" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>
                We grade ourselves on this too.
              </h2>
            </div>
            <p className="mono" style={{ color: "var(--dim)", lineHeight: 1.7 }}>
              {AUDIT.url}
              <br />
              {AUDIT.strategy} · {AUDIT.measuredOn}
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <dl className="mt-14 grid grid-cols-2 border-t md:grid-cols-4" style={{ borderColor: "var(--rule)" }}>
            {AUDIT.scores.map((score) => (
              <div
                key={score.label}
                className="border-b py-8 pr-6 md:border-l md:pl-7 md:first:border-l-0 md:first:pl-0"
                style={{ borderColor: "var(--rule)" }}
              >
                <dt className="mono" style={{ color: "var(--dim)", fontSize: "0.58rem" }}>
                  {score.label}
                </dt>
                <dd
                  className="mt-4 leading-none"
                  style={{
                    fontStretch: "78%",
                    fontWeight: 660,
                    fontSize: "clamp(2.75rem, 5vw, 4rem)",
                    letterSpacing: "-0.05em",
                  }}
                >
                  {score.value}
                </dd>
                {/* A rule filled to the score. No traffic-light colours — the
                    number already says it, and three more hues would break the
                    palette for no added information. */}
                <div className="mt-5 h-px w-full" style={{ background: "var(--rule)" }}>
                  <div
                    className="h-px"
                    style={{ width: `${score.value}%`, background: "var(--violet-lift)" }}
                  />
                </div>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-10">
            <p className="lede max-w-[54ch]">
              Straight from Google PageSpeed Insights, and the full report is public — we run the
              same audit against your site and against whoever currently outranks you, then re-run
              it after every build.
            </p>
            <a
              href={AUDIT.report}
              target="_blank"
              rel="noopener noreferrer"
              className="arrow-link mt-7"
              style={{ color: "var(--violet-lift)" }}
            >
              Read the full report <span aria-hidden="true">↗</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
