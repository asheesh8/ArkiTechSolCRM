"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Building2, Code2, Gauge, Layers3, Search, ShieldCheck } from "lucide-react";
import { useRef } from "react";

const SERVICES = [
  { icon: Code2, title: "Websites & platforms", text: "High-performance marketing sites, customer portals, e-commerce, and custom web applications." },
  { icon: Layers3, title: "Business systems", text: "Purpose-built CRMs, workflow automation, integrations, and internal tools that remove operational friction." },
  { icon: Search, title: "Digital growth", text: "SEO foundations, conversion strategy, analytics, and campaigns designed around measurable outcomes." },
  { icon: Gauge, title: "Optimization", text: "Performance, accessibility, security, and UX improvements for existing digital products." },
  { icon: Building2, title: "Enterprise delivery", text: "Scalable architecture, stakeholder-ready planning, and dependable execution for growing organizations." },
  { icon: ShieldCheck, title: "Ongoing partnership", text: "Reliable maintenance, monitoring, content support, and technical guidance after launch." },
] as const;

export function CompanySections() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return <>
    <section id="services" ref={ref} className="relative px-6 py-24 sm:py-32" style={{ background: "#10101e" }}>
      <div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400/70">What we do</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">Digital infrastructure for ambitious organizations.</h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/45">From a focused launch to a company-wide platform, ArkiTech combines strategy, design, and engineering in one accountable team.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">{SERVICES.map(({ icon: Icon, title, text }, index) => (
          <motion.article key={title} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: index * 0.06 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
            <Icon className="h-6 w-6 text-violet-300" /><h3 className="mt-5 text-lg font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/40">{text}</p>
          </motion.article>
        ))}</div>
      </div></div>
    </section>
    <section id="about" className="relative overflow-hidden px-6 py-24 sm:py-32" style={{ background: "#0c0c18" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div className="relative min-h-[430px]">
          <div className="absolute left-0 top-0 w-[78%] overflow-hidden rounded-3xl border border-white/10 shadow-2xl"><Image src="/ChatGPT_Image_Jun_28_2026_07_36_14_PM.png" alt="ArkiTech team collaborating on digital product work" width={836} height={470} loading="eager" className="h-72 w-full object-cover sm:h-96" /></div>
          <div className="absolute bottom-0 right-0 w-[58%] overflow-hidden rounded-3xl border-4 border-[#0c0c18] shadow-2xl"><Image src="/Gemini_Generated_Image_gcdymbgcdymbgcdy.png" alt="Modern technology workspace" width={683} height={384} className="h-48 w-full object-cover sm:h-56" /></div>
        </div>
        <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300/70">About ArkiTech</p><h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">Built to solve the hard parts, not just decorate them.</h2>
          <p className="mt-6 text-base leading-8 text-white/50">ArkiTech Solutions is a Vermont-based digital product studio serving organizations of every size. We turn complex business needs into clear, fast, dependable digital experiences.</p>
          <p className="mt-4 text-base leading-8 text-white/50">Our work spans customer-facing websites, internal platforms, automation, and long-term technical partnerships. Every engagement is shaped around the organization, its users, and the outcomes that matter.</p>
          <div className="mt-8 grid grid-cols-3 gap-3">{["Strategy-led", "Senior execution", "Built to scale"].map((item) => <div key={item} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-4 text-center text-xs font-semibold text-white/65">{item}</div>)}</div>
        </div>
      </div>
    </section>
  </>;
}
