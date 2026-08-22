import { Reveal } from "./reveal";

/**
 * The "who you'd actually be working with" block on every service-area page.
 *
 * Deliberately identical across towns. It is the one part of a location page
 * that *should* repeat — the trust signal doesn't change because the town did,
 * and pretending otherwise is how these pages start reading like spam.
 */
export function LocalStory({ town }: { town: string }) {
  return (
    <section className="band-paper site-section">
      <div className="site-shell grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <Reveal>
          <div>
            <p className="eyebrow">Who you&apos;d be working with</p>
            <h2 className="d2" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>
              Two people, both of them here.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="max-w-[58ch]">
            <p style={{ color: "var(--dim)", lineHeight: 1.8 }}>
              ArkiTech is Ashish Subedi and Teibiroa Ambo. Ashish studied at Champlain College in
              Burlington and writes every line of what we ship — no agency layer, no junior handed
              the project after you sign. Teibiroa handles the relationship, which in practice means
              you get a person on the phone rather than a ticket number.
            </p>
            <p className="mt-5" style={{ color: "var(--dim)", lineHeight: 1.8 }}>
              We both live here. That is not a marketing line about being &ldquo;locally owned&rdquo;
              — it means we know why {town} searches the way it does, we have driven the roads your
              customers drive, and if something breaks we are a phone call away in the same time
              zone, not a support queue in another one.
            </p>

            <dl className="ledger mt-12">
              {[
                ["Based", "Burlington, Vermont"],
                ["Who builds it", "Ashish, start to finish"],
                ["Who you call", "Teibiroa, or Ashish directly"],
                ["Outsourced", "None of it"],
              ].map(([term, detail]) => (
                <div
                  key={term}
                  className="flex items-baseline justify-between gap-6 border-b py-3.5"
                  style={{ borderColor: "var(--rule)" }}
                >
                  <dt className="mono" style={{ color: "var(--dim)", fontSize: "0.58rem" }}>{term}</dt>
                  <dd className="text-sm" style={{ fontStretch: "88%", fontWeight: 560 }}>{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
