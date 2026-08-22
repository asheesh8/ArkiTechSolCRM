"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Reveal } from "./reveal";

const SERVICES = [
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

const PRINCIPLES = [
  { title: "Strategy-led", text: "We define the business outcome before choosing the technology or drawing the interface." },
  { title: "Senior execution", text: "The people in the room are the people making the work — fewer layers, faster decisions." },
  { title: "Built to scale", text: "Every system is considered beyond launch, from maintainability to the next phase of growth." },
] as const;

export function CompanySections() {
  const reduceMotion = useReducedMotion();
  const [activeService, setActiveService] = useState(0);
  const [activePrinciple, setActivePrinciple] = useState(0);
  const service = SERVICES[activeService];

  return (
    <>
      {/* ── Capabilities ─────────────────────────────────────────────────────
          Was a floating rounded card of six differently-coloured tabs. It is
          now a ledger: numbered rows on a rule, one accent, detail alongside.
          Six accent colours were doing the work that hierarchy should do. */}
      <section id="services" className="band-raised site-section">
        <div className="site-shell">
          <Reveal>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">What we do</p>
                <h2 className="d2 max-w-[14ch]">One team for the whole picture.</h2>
              </div>
              <p className="lede lg:max-w-[34ch] lg:text-right">
                Strategy, design, and engineering under one roof — brought to bear on whichever
                part of the problem is actually in the way.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-x-16 gap-y-10 lg:grid-cols-[1fr_1.05fr]">
            {/* Ledger */}
            <Reveal>
              <div className="ledger">
                {SERVICES.map((item, index) => {
                  const active = index === activeService;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setActiveService(index)}
                      onMouseEnter={() => setActiveService(index)}
                      onFocus={() => setActiveService(index)}
                      className="ledger-row w-full cursor-pointer text-left"
                      style={{
                        gridTemplateColumns: "3rem 1fr",
                        paddingLeft: active ? "0.9rem" : undefined,
                        opacity: active ? 1 : 0.68,
                      }}
                    >
                      <span className="figure-index" style={{ color: active ? "var(--violet-lift)" : "var(--dim)" }}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="d3 block" style={{ fontSize: "clamp(1.35rem, 2vw, 1.75rem)" }}>
                          {item.title}
                        </span>
                        <span className="mt-1.5 block text-sm" style={{ color: "var(--dim)", lineHeight: 1.55 }}>
                          {item.short}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* Detail — sticky so the ledger scrolls against a fixed reference */}
            <Reveal delay={120}>
              <div className="lg:sticky lg:top-32">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                    transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.2, 0.65, 0.2, 1] }}
                    className="border p-8 sm:p-11"
                    style={{ borderColor: "var(--rule)" }}
                  >
                    <p className="mono" style={{ color: "var(--dim)" }}>
                      Capability {String(activeService + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
                    </p>

                    <h3 className="d3 mt-7">{service.title}</h3>
                    <p className="mt-5 text-[0.98rem]" style={{ color: "var(--dim)", lineHeight: 1.65 }}>
                      {service.text}
                    </p>

                    <ul className="mt-9 border-t" style={{ borderColor: "var(--rule)" }}>
                      {service.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-baseline gap-4 border-b py-3.5"
                          style={{ borderColor: "var(--rule)" }}
                        >
                          <span aria-hidden="true" style={{ color: "var(--violet-lift)", fontSize: "0.7rem" }}>—</span>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-9 flex flex-wrap items-end justify-between gap-6">
                      <div>
                        <p className="mono" style={{ color: "var(--dim)" }}>The result</p>
                        <p className="mt-2 text-lg" style={{ fontStretch: "86%", fontWeight: 600, letterSpacing: "-0.02em" }}>
                          {service.outcome}
                        </p>
                      </div>
                      <a href="#showcase" className="arrow-link" style={{ color: "var(--violet-lift)" }}>
                        See the work <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── The studio ───────────────────────────────────────────────────────
          A light band. The whole page was one shade of near-black, and nothing
          makes a dark site feel considered like proving it can hold paper. */}
      <section id="about" className="band-paper site-section">
        <div className="site-shell grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div>
              {/* Squared frames, hairline rules, no tilt on hover. */}
              <div className="border p-2" style={{ borderColor: "var(--rule)" }}>
                <Image
                  src="/ChatGPT_Image_Jun_28_2026_07_36_14_PM.png"
                  alt="ArkiTech team collaborating on digital product work"
                  width={836}
                  height={470}
                  loading="eager"
                  className="h-72 w-full object-cover sm:h-[26rem]"
                />
              </div>
              <div className="mt-3 grid grid-cols-[1.15fr_1fr] gap-3">
                <div className="border p-2" style={{ borderColor: "var(--rule)" }}>
                  <Image
                    src="/Gemini_Generated_Image_gcdymbgcdymbgcdy.png"
                    alt="Modern technology workspace"
                    width={683}
                    height={384}
                    className="h-36 w-full object-cover sm:h-44"
                  />
                </div>
                <div
                  className="flex flex-col justify-between border p-5"
                  style={{ borderColor: "var(--rule)" }}
                >
                  <span className="mono" style={{ color: "var(--dim)" }}>Based in</span>
                  <span
                    className="text-xl leading-none"
                    style={{ fontStretch: "80%", fontWeight: 660, letterSpacing: "-0.035em" }}
                  >
                    Burlington,<br />Vermont
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div>
              <p className="eyebrow">About ArkiTech</p>
              <h2 className="d2">
                Built to solve the hard parts,{" "}
                <span style={{ color: "rgba(10,10,14,0.32)" }}>not just decorate them.</span>
              </h2>

              <p className="mt-8 max-w-[46ch]" style={{ color: "var(--dim)", lineHeight: 1.7 }}>
                ArkiTech Solutions is a Vermont-based digital product studio serving organizations of
                every size. We turn complex business needs into clear, fast, dependable digital
                experiences.
              </p>
              <p className="mt-4 max-w-[46ch]" style={{ color: "var(--dim)", lineHeight: 1.7 }}>
                Our work spans customer-facing websites, internal platforms, automation, and
                long-term technical partnerships.
              </p>

              <div className="ledger mt-12" aria-label="ArkiTech operating principles">
                {PRINCIPLES.map((item, index) => {
                  const active = index === activePrinciple;
                  return (
                    <div key={item.title} className="border-b" style={{ borderColor: "var(--rule)" }}>
                      <button
                        type="button"
                        aria-expanded={active}
                        onClick={() => setActivePrinciple(index)}
                        className="flex w-full cursor-pointer items-center gap-5 py-5 text-left"
                      >
                        <span className="figure-index">{String(index + 1).padStart(2, "0")}</span>
                        <span className="d3" style={{ fontSize: "clamp(1.2rem, 1.7vw, 1.45rem)" }}>
                          {item.title}
                        </span>
                        <span
                          aria-hidden="true"
                          className="ml-auto text-lg transition-transform duration-200"
                          style={{ color: "var(--dim)", transform: active ? "rotate(45deg)" : "none" }}
                        >
                          +
                        </span>
                      </button>
                      {/* Grid-rows trick: animates to the content's real height
                          without measuring it, and collapses cleanly to zero. */}
                      <div
                        className="grid transition-[grid-template-rows] duration-300 ease-out"
                        style={{ gridTemplateRows: active ? "1fr" : "0fr" }}
                      >
                        <div className="overflow-hidden">
                          <p className="pb-6 pl-[3.5rem] text-sm" style={{ color: "var(--dim)", lineHeight: 1.65 }}>
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
