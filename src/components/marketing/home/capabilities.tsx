"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const CAPABILITIES = [
  {
    title: "Websites & platforms",
    short: "Digital experiences that earn attention and make complex journeys feel simple.",
    text: "We pair sharp brand expression with production-grade engineering to create websites and applications that feel exceptional on every screen.",
    deliverables: ["Corporate & campaign sites", "Customer portals", "E-commerce & web apps"],
    outcome: "Built to convert, perform, and scale.",
  },
  {
    title: "Business systems",
    short: "Purpose-built tools for the work happening behind the scenes.",
    text: "We replace disconnected spreadsheets and repetitive tasks with clear workflows, integrated data, and software shaped around your team.",
    deliverables: ["Custom CRM platforms", "Workflow automation", "Internal dashboards"],
    outcome: "Less friction. More operational leverage.",
  },
  {
    title: "Digital growth",
    short: "A stronger foundation for discovery, trust, and measurable demand.",
    text: "Strategy, search, content structure, and analytics work together so your digital presence supports the way your organization actually grows.",
    deliverables: ["SEO foundations", "Conversion strategy", "Analytics & attribution"],
    outcome: "Turn attention into qualified action.",
  },
  {
    title: "Optimization",
    short: "Make the digital products you already own noticeably better.",
    text: "We identify the technical and experience issues holding a product back, then improve speed, usability, accessibility, and confidence.",
    deliverables: ["Performance audits", "Accessibility upgrades", "UX & conversion reviews"],
    outcome: "Faster experiences with fewer weak points.",
  },
  {
    title: "Enterprise delivery",
    short: "Structured execution for complex teams and higher-stakes launches.",
    text: "We bring senior technical direction, stakeholder-ready planning, and an adaptable delivery model to initiatives with more moving parts.",
    deliverables: ["Technical discovery", "Scalable architecture", "Cross-team delivery"],
    outcome: "Clarity from roadmap through launch.",
  },
  {
    title: "Ongoing partnership",
    short: "A dependable technical team that stays after the launch.",
    text: "We keep critical experiences healthy and moving forward through proactive maintenance, thoughtful iteration, and direct senior support.",
    deliverables: ["Monitoring & maintenance", "Product iteration", "Technical guidance"],
    outcome: "Long-term momentum without the handoff gap.",
  },
] as const;

/**
 * Six capabilities as a switchboard: pick a line on the left, the detail
 * lights on the right. Hover previews, click holds.
 */
export function Capabilities() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const c = CAPABILITIES[active];

  return (
    <section className="band-2 section">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 className="ak-display h-xl">One team for the whole picture.</h2>
          <p className="ak-lede mt-6 max-w-[52ch]">
            Strategy, design, and engineering under one roof, brought to bear on whichever part of the problem is
            actually in the way.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          <div role="tablist" aria-label="Capabilities" className="border-t border-[var(--rule)]">
            {CAPABILITIES.map((item, i) => {
              const on = i === active;
              return (
                <button
                  key={item.title}
                  role="tab"
                  id={`cap-tab-${i}`}
                  aria-selected={on}
                  aria-controls="cap-panel"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group relative block w-full border-b border-[var(--rule)] py-5 pl-5 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-5 bottom-5 w-[2px] origin-top bg-[var(--lamp)] transition-transform duration-500 ${
                      on ? "scale-y-100" : "scale-y-0"
                    }`}
                  />
                  <span
                    className={`display block text-[clamp(1.4rem,2vw,1.8rem)] leading-tight transition-colors duration-200 ${
                      on ? "text-[var(--fg)]" : "text-[var(--dim)] group-hover:text-[var(--fg)]"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--dim)]">{item.short}</span>
                </button>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={c.title}
                id="cap-panel"
                role="tabpanel"
                aria-labelledby={`cap-tab-${active}`}
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[var(--bg)] p-8 shadow-[var(--shadow)] sm:p-11"
              >
                <h3 className="ak-display h-lg">{c.title}</h3>
                <p className="mt-5 max-w-[48ch] text-[1.02rem] leading-relaxed text-[var(--fg-2)]">{c.text}</p>
                <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                  {c.deliverables.map((d) => (
                    <li key={d} className="border-t border-[var(--rule-strong)] pt-3 text-[0.95rem]">
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-10 text-sm text-[var(--dim)]">The result</p>
                <p className="ak-display mt-1 text-[1.6rem] leading-snug">{c.outcome}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
