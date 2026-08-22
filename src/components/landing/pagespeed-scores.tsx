import Image from "next/image";
import { AUDIT } from "@/lib/pagespeed-audit";
import { Reveal } from "./reveal";

export function PageSpeedScores() {
  return (
    <section className="band-raised site-section">
      <div className="site-shell">
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

        <div className="mt-14 grid items-start gap-x-14 gap-y-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Reveal>
              {/* Google's own UI, dropped in unretouched. It is the one element
                  on the site allowed to break the palette — a screenshot that
                  matched our colours would defeat the point of being a
                  screenshot. */}
              <figure className="border p-3" style={{ borderColor: "var(--rule)", background: "#fff" }}>
                <Image
                  src={AUDIT.shot}
                  alt={`Google PageSpeed Insights results for ${AUDIT.url}: ${AUDIT.scores
                    .map((s) => `${s.label} ${s.value}`)
                    .join(", ")}.`}
                  width={1884}
                  height={324}
                  className="h-auto w-full"
                />
              </figure>
            </Reveal>

            <Reveal delay={90}>
              <dl className="mt-10 grid grid-cols-2 border-t sm:grid-cols-4" style={{ borderColor: "var(--rule)" }}>
                {AUDIT.scores.map((score) => (
                  <div
                    key={score.label}
                    className="border-b py-7 pr-5 sm:border-l sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
                    style={{ borderColor: "var(--rule)" }}
                  >
                    <dt className="mono" style={{ color: "var(--dim)", fontSize: "0.56rem" }}>
                      {score.label}
                    </dt>
                    <dd
                      className="mt-3.5 leading-none"
                      style={{
                        fontStretch: "78%",
                        fontWeight: 660,
                        fontSize: "clamp(2.25rem, 3.6vw, 3.1rem)",
                        letterSpacing: "-0.05em",
                      }}
                    >
                      {score.value}
                    </dd>
                    {/* A rule filled to the score. No traffic-light colours —
                        the gauges above already carry them, and three more hues
                        in the type would add nothing. */}
                    <div className="mt-4 h-px w-full" style={{ background: "var(--rule)" }}>
                      <div className="h-px" style={{ width: `${score.value}%`, background: "var(--violet-lift)" }} />
                    </div>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={140}>
            <div className="lg:border-l lg:pl-12" style={{ borderColor: "var(--rule)" }}>
              <p style={{ color: "var(--dim)", lineHeight: 1.75 }}>
                Straight from Google PageSpeed Insights, and the full report is public — we run the
                same audit against your site and against whoever currently outranks you, then re-run
                it after every build.
              </p>

              <a
                href={AUDIT.report}
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-link mt-9"
                style={{ color: "var(--violet-lift)" }}
              >
                Read the full report <span aria-hidden="true">↗</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
