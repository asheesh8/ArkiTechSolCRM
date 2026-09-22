"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Plate } from "@/components/marketing/art/plate";
import { Reveal } from "@/components/marketing/site/reveal";
import { PLATES } from "@/lib/marketing/art";
import { SITE } from "@/lib/marketing/site";

const PRINCIPLES = [
  { title: "Strategy-led", text: "We define the business outcome before choosing the technology or drawing the interface." },
  { title: "Senior execution", text: "The people in the room are the people making the work. Fewer layers, faster decisions." },
  { title: "Built to scale", text: "Every system is considered beyond launch, from maintainability to the next phase of growth." },
] as const;

const FACTS = [
  { term: "Based", value: SITE.studio },
  { term: "Founded", value: SITE.founded },
  { term: "Practice", value: "Design & engineering" },
  { term: "Engagements", value: "Project & retained" },
];

export function Studio() {
  const [open, setOpen] = useState(0);

  return (
    <section id="studio" className="band section">
      {/* The old site anchored this as #about. */}
      <span id="about" aria-hidden="true" className="block scroll-mt-24" />
      <div className="shell grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <figure>
            <div className="relative aspect-[1/1] overflow-hidden border border-[var(--rule)] bg-[var(--bg-2)]">
              <Plate
                name="chart-burlington"
                label="Burlington Bay on the 1874 U.S. Coast Survey chart of Lake Champlain"
                className="absolute inset-[-4%] h-[108%] w-[108%] opacity-[0.75]"
              />
              {/* Where the studio is, on a chart drawn 150 years before it. */}
              <span
                aria-hidden="true"
                className="absolute left-[78.5%] top-[62%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-[var(--lamp)] outline outline-4 outline-[color-mix(in_srgb,var(--lamp)_30%,transparent)]"
              />
            </div>
            <figcaption className="mt-3 text-sm text-[var(--dim)]">{PLATES["chart-burlington"].caption}</figcaption>
          </figure>
        </Reveal>

        <Reveal delay={100}>
          <div>
            <h2 className="ak-display h-xl">
              Built to solve the hard parts, <span className="text-[var(--dim)]">not just decorate them.</span>
            </h2>
            <div className="mt-8 grid max-w-[52ch] gap-4 text-[1.04rem] leading-relaxed text-[var(--fg-2)]">
              <p>
                ArkiTech Solutions is a Vermont-based digital product studio serving organizations of every size. We
                turn complex business needs into clear, fast, dependable digital experiences.
              </p>
              <p>
                Our work spans customer-facing websites, internal platforms, automation, and long-term technical
                partnerships.
              </p>
            </div>

            <div className="mt-10 border-t border-[var(--rule)]">
              {PRINCIPLES.map((p, i) => {
                const on = open === i;
                return (
                  <div key={p.title} className="border-b border-[var(--rule)]">
                    <button
                      type="button"
                      aria-expanded={on}
                      onClick={() => setOpen(on ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className="ak-display text-[1.55rem] leading-none">{p.title}</span>
                      <Plus
                        size={18}
                        aria-hidden="true"
                        className={`shrink-0 text-[var(--dim)] transition-transform duration-300 ${on ? "rotate-45" : ""}`}
                      />
                    </button>
                    <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
                      <div className="overflow-hidden">
                        <p className="max-w-[48ch] pb-6 text-[var(--fg-2)]">{p.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5">
              {FACTS.map((f) => (
                <div key={f.term}>
                  <dt className="text-sm text-[var(--dim)]">{f.term}</dt>
                  <dd className="mt-1 font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
