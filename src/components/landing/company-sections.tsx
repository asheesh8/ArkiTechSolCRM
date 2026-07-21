"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Check,
  Code2,
  Gauge,
  Layers3,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useRef, useState } from "react";

const SERVICES = [
  {
    icon: Code2,
    title: "Websites & platforms",
    short: "Digital experiences that earn attention and make complex journeys feel simple.",
    text: "We pair sharp brand expression with production-grade engineering to create websites and applications that feel exceptional on every screen.",
    deliverables: ["Corporate & campaign sites", "Customer portals", "E-commerce & web apps"],
    outcome: "Built to convert, perform, and scale.",
    color: "#a78bfa",
  },
  {
    icon: Layers3,
    title: "Business systems",
    short: "Purpose-built tools for the work happening behind the scenes.",
    text: "We replace disconnected spreadsheets and repetitive tasks with clear workflows, integrated data, and software shaped around your team.",
    deliverables: ["Custom CRM platforms", "Workflow automation", "Internal dashboards"],
    outcome: "Less friction. More operational leverage.",
    color: "#22d3ee",
  },
  {
    icon: Search,
    title: "Digital growth",
    short: "A stronger foundation for discovery, trust, and measurable demand.",
    text: "Strategy, search, content structure, and analytics work together so your digital presence supports the way your organization actually grows.",
    deliverables: ["SEO foundations", "Conversion strategy", "Analytics & attribution"],
    outcome: "Turn attention into qualified action.",
    color: "#60a5fa",
  },
  {
    icon: Gauge,
    title: "Optimization",
    short: "Make the digital products you already own noticeably better.",
    text: "We identify the technical and experience issues holding a product back, then improve speed, usability, accessibility, and confidence.",
    deliverables: ["Performance audits", "Accessibility upgrades", "UX & conversion reviews"],
    outcome: "Faster experiences with fewer weak points.",
    color: "#f472b6",
  },
  {
    icon: Building2,
    title: "Enterprise delivery",
    short: "Structured execution for complex teams and higher-stakes launches.",
    text: "We bring senior technical direction, stakeholder-ready planning, and an adaptable delivery model to initiatives with more moving parts.",
    deliverables: ["Technical discovery", "Scalable architecture", "Cross-team delivery"],
    outcome: "Clarity from roadmap through launch.",
    color: "#34d399",
  },
  {
    icon: ShieldCheck,
    title: "Ongoing partnership",
    short: "A dependable technical team that stays after the launch.",
    text: "We keep critical experiences healthy and moving forward through proactive maintenance, thoughtful iteration, and direct senior support.",
    deliverables: ["Monitoring & maintenance", "Product iteration", "Technical guidance"],
    outcome: "Long-term momentum without the handoff gap.",
    color: "#fbbf24",
  },
] as const;

const PRINCIPLES = [
  { title: "Strategy-led", text: "We define the business outcome before choosing the technology or drawing the interface." },
  { title: "Senior execution", text: "The people in the room are the people making the work—fewer layers, faster decisions." },
  { title: "Built to scale", text: "Every system is considered beyond launch, from maintainability to the next phase of growth." },
] as const;

export function CompanySections() {
  const servicesRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: "-10%" });
  const aboutInView = useInView(aboutRef, { once: true, margin: "-10%" });
  const [activeService, setActiveService] = useState(0);
  const [activePrinciple, setActivePrinciple] = useState(0);
  const service = SERVICES[activeService];
  const ServiceIcon = service.icon;

  return (
    <>
      <section id="services" ref={servicesRef} className="relative overflow-hidden px-6 py-24 sm:py-32" style={{ background: "#10101e" }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.45) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.45) 1px,transparent 1px)", backgroundSize: "72px 72px" }} />
        <motion.div className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full blur-[120px]" animate={{ backgroundColor: service.color }} transition={{ duration: 0.7 }} style={{ opacity: 0.12 }} />

        <div className="relative mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={servicesInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400/70">What we do</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">One team for the whole digital picture.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/45">Explore how strategy, design, and engineering come together around your organization.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={servicesInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.12 }} className="overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0b0b16]/85 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
              <div className="border-b border-white/[0.07] p-3 sm:p-4 lg:border-b-0 lg:border-r">
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                  {SERVICES.map(({ icon: Icon, title, short, color }, index) => {
                    const active = index === activeService;
                    return (
                      <button
                        key={title}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setActiveService(index)}
                        onMouseEnter={() => setActiveService(index)}
                        onFocus={() => setActiveService(index)}
                        className="group relative overflow-hidden rounded-2xl px-3 py-4 text-left transition sm:px-4 lg:px-5"
                        style={{ background: active ? `${color}12` : "transparent" }}
                      >
                        {active && <motion.span layoutId="service-active" className="absolute inset-0 rounded-2xl border" style={{ borderColor: `${color}55`, boxShadow: `inset 0 0 30px ${color}0b` }} transition={{ type: "spring", stiffness: 320, damping: 30 }} />}
                        <span className="relative flex items-start gap-3 sm:gap-4">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition sm:h-10 sm:w-10" style={{ borderColor: active ? `${color}55` : "rgba(255,255,255,.08)", color: active ? color : "rgba(255,255,255,.35)", background: active ? `${color}16` : "rgba(255,255,255,.025)" }}><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold leading-5 text-white sm:text-base">{title}</span>
                            <span className="mt-1 hidden text-xs leading-5 text-white/35 lg:block">{short}</span>
                          </span>
                          <span className="ml-auto hidden font-mono text-[10px] text-white/20 sm:block">0{index + 1}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative min-h-[500px] overflow-hidden p-6 sm:p-10 lg:p-12">
                <AnimatePresence mode="wait">
                  <motion.div key={service.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }} className="relative z-10 flex h-full flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border" style={{ color: service.color, borderColor: `${service.color}55`, background: `${service.color}14`, boxShadow: `0 0 40px ${service.color}18` }}><ServiceIcon className="h-7 w-7" /></div>
                      <span className="font-mono text-xs uppercase tracking-[0.22em] text-white/25">Capability 0{activeService + 1}</span>
                    </div>
                    <h3 className="mt-9 max-w-xl text-3xl font-black tracking-tight text-white sm:text-5xl">{service.title}</h3>
                    <p className="mt-5 max-w-xl text-base leading-7 text-white/50 sm:text-lg sm:leading-8">{service.text}</p>
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                      {service.deliverables.map((item) => <div key={item} className="flex items-start gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3 text-xs font-medium leading-5 text-white/65"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: service.color }} />{item}</div>)}
                    </div>
                    <div className="mt-auto flex flex-col gap-5 border-t border-white/[0.07] pt-8 sm:flex-row sm:items-end sm:justify-between">
                      <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/25">The result</p><p className="mt-2 text-lg font-bold text-white">{service.outcome}</p></div>
                      <a href="#showcase" className="group flex w-fit items-center gap-2 text-sm font-semibold" style={{ color: service.color }}>See the work <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <motion.div key={service.color} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none absolute -bottom-40 -right-40 h-[430px] w-[430px] rounded-full blur-[100px]" style={{ background: service.color, opacity: 0.1 }} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" ref={aboutRef} className="relative overflow-hidden px-6 py-24 sm:py-32" style={{ background: "#0c0c18" }}>
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <motion.div initial={{ opacity: 0, x: -35 }} animate={aboutInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="group relative min-h-[430px] sm:min-h-[520px]">
            <motion.div whileHover={{ rotate: -1.5, scale: 1.015 }} transition={{ type: "spring", stiffness: 180, damping: 20 }} className="absolute left-0 top-0 w-[82%] overflow-hidden rounded-3xl border border-white/10 bg-[#171727] p-2 shadow-2xl">
              <div className="overflow-hidden rounded-[18px]"><Image src="/ChatGPT_Image_Jun_28_2026_07_36_14_PM.png" alt="ArkiTech team collaborating on digital product work" width={836} height={470} loading="eager" className="h-72 w-full object-cover transition duration-700 group-hover:scale-[1.03] sm:h-96" /></div>
            </motion.div>
            <motion.div whileHover={{ rotate: 2, scale: 1.03, y: -6 }} transition={{ type: "spring", stiffness: 180, damping: 18 }} className="absolute bottom-0 right-0 w-[62%] overflow-hidden rounded-3xl border-4 border-[#0c0c18] bg-[#171727] p-1.5 shadow-2xl">
              <div className="overflow-hidden rounded-[18px]"><Image src="/Gemini_Generated_Image_gcdymbgcdymbgcdy.png" alt="Modern technology workspace" width={683} height={384} className="h-48 w-full object-cover transition duration-700 group-hover:scale-[1.04] sm:h-60" /></div>
            </motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }} className="absolute bottom-14 left-3 rounded-2xl border border-white/10 bg-[#121221]/90 px-4 py-3 shadow-xl backdrop-blur-xl sm:left-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/60">Based in</p><p className="mt-1 text-sm font-bold text-white">Burlington, Vermont</p>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 35 }} animate={aboutInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.08 }}>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300/70">About ArkiTech</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">Built to solve the hard parts, <span className="text-white/25">not just decorate them.</span></h2>
            <p className="mt-6 text-base leading-8 text-white/50">ArkiTech Solutions is a Vermont-based digital product studio serving organizations of every size. We turn complex business needs into clear, fast, dependable digital experiences.</p>
            <p className="mt-4 text-base leading-8 text-white/50">Our work spans customer-facing websites, internal platforms, automation, and long-term technical partnerships.</p>

            <div className="mt-8 space-y-2">
              {PRINCIPLES.map((item, index) => {
                const active = index === activePrinciple;
                return <button key={item.title} type="button" onClick={() => setActivePrinciple(index)} onMouseEnter={() => setActivePrinciple(index)} onFocus={() => setActivePrinciple(index)} className="w-full rounded-2xl border px-4 py-4 text-left transition sm:px-5" style={{ borderColor: active ? "rgba(147,197,253,.28)" : "rgba(255,255,255,.06)", background: active ? "rgba(147,197,253,.07)" : "rgba(255,255,255,.02)" }}>
                  <span className="flex items-center gap-4"><span className="font-mono text-[10px] text-white/25">0{index + 1}</span><span className="font-bold text-white">{item.title}</span><motion.span animate={{ rotate: active ? 45 : 0 }} className="ml-auto text-lg text-white/30">+</motion.span></span>
                  <AnimatePresence initial={false}>{active && <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="block overflow-hidden"><span className="block pl-9 pt-3 text-sm leading-6 text-white/40">{item.text}</span></motion.span>}</AnimatePresence>
                </button>;
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
