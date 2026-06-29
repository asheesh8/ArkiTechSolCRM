"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const TEAM = [
  {
    name: "Ashish Subedi",
    role: "CEO & Fullstack Designer",
    bio: "The architect behind every build. Ashish handles product vision, engineering, and design — making sure every site is fast, beautiful, and built to convert.",
    initials: "AS",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    glow: "#7c3aed",
    tags: ["Fullstack Dev", "UI/UX", "Product"],
  },
  {
    name: "Teibiroa Ambo",
    role: "Director of Client Relations",
    bio: "Tei is the voice of ArkiTech — building trust with every call, nurturing long-term client relationships, and making sure every business we work with feels like a priority.",
    initials: "TA",
    gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    glow: "#059669",
    tags: ["Client Success", "Sales", "Relations", "Consultant"],
    phone: "(802) 557-8828",
  },
  {
    name: "Krish Dahal",
    role: "Frontend Engineer & Digital Strategist",
    bio: "Krish brings interfaces to life with pixel-perfect execution and drives organic growth through smart digital marketing that puts clients in front of the right people.",
    initials: "KD",
    gradient: "linear-gradient(135deg, #0891b2 0%, #6366f1 100%)",
    glow: "#0891b2",
    tags: ["Frontend", "UI Dev", "Marketing"],
  },
] as const;

export function TeamSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="relative overflow-hidden py-20 px-6 lg:py-32" style={{ background: "#0e0e1c" }}>
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative mx-auto max-w-6xl">
        {/* Label + heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: "rgba(168,85,247,0.6)" }}>The team</p>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Built by people who<br />
            <span style={{ background: "linear-gradient(135deg,#c4b5fd,#93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              actually give a dang.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.35)" }}>
            Small team. Big output. Every client gets our full attention.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {TEAM.map((person, i) => (
            <motion.div
              key={person.name}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl p-6 flex flex-col gap-5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: `0 0 0 0 ${person.glow}00`,
                transition: "box-shadow 0.4s ease, border-color 0.4s ease",
              }}
              whileHover={{ boxShadow: `0 0 60px ${person.glow}22` }}
            >
              {/* Glow accent top-left */}
              <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle, ${person.glow}30, transparent 70%)` }} />

              {/* Avatar */}
              <div className="flex items-end justify-between">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white"
                  style={{
                    background: person.gradient,
                    boxShadow: `0 8px 30px ${person.glow}50`,
                  }}
                >
                  {person.initials}
                </div>
                {/* Number */}
                <span className="font-mono text-5xl font-black leading-none" style={{ color: "rgba(255,255,255,0.04)" }}>
                  0{i + 1}
                </span>
              </div>

              {/* Info */}
              <div>
                <p className="text-lg font-bold text-white">{person.name}</p>
                <p className="mt-0.5 text-sm font-medium" style={{ color: person.glow === "#7c3aed" ? "#a78bfa" : person.glow === "#0891b2" ? "#67e8f9" : "#6ee7b7" }}>
                  {person.role}
                </p>
              </div>

              <p className="flex-1 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                {person.bio}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {person.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: `${person.glow}18`, color: `${person.glow}cc`, border: `1px solid ${person.glow}28` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {"phone" in person && (
                <a
                  href={`tel:+1${(person as any).phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-2 text-xs font-medium transition hover:opacity-80"
                  style={{ color: `${person.glow}99` }}
                >
                  <span style={{ color: person.glow }}>📞</span>
                  {(person as any).phone}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
