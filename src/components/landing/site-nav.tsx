"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { services } from "@/lib/services-content";

const ABOUT_LINKS = [
  { href: "/#about", label: "The studio" },
  { href: "/#showcase", label: "Our work" },
  { href: "/#team", label: "The team" },
];

/**
 * Site navigation.
 *
 * Hides on scroll-down and returns on scroll-up, but never while a menu is open or
 * something inside it holds focus — a nav that slides away under a keyboard user is
 * how you lose them.
 */
export function SiteNav({ onStartProject }: { onStartProject?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);
  const navRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const pinned = openMenu !== null || mobileOpen;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastY.current;
    if (pinned || latest < 72) {
      setVisible(true);
      lastY.current = latest;
      return;
    }
    if (Math.abs(delta) < 8) return;
    setVisible(delta < 0);
    lastY.current = latest;
  });

  // Escape closes whatever is open; a click outside closes the dropdowns.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (navRef.current?.contains(event.target as Node)) return;
      setOpenMenu(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  // Don't leave the page scrollable behind an open mobile panel.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <motion.nav
      ref={navRef}
      initial={false}
      animate={{ y: visible ? 0 : "-110%" }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      onFocusCapture={() => setVisible(true)}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.055] bg-[#0c0c18]/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link
          href="/"
          aria-label="ArkiTech Solutions home"
          className="relative h-9 w-40 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.24)] sm:w-48"
        >
          <Image src="/arkitech-banner.png" alt="" fill priority sizes="(min-width: 640px) 192px, 160px" className="object-cover object-center" />
        </Link>

        {/* desktop */}
        <div className="hidden items-center gap-1 text-sm font-medium text-white/60 lg:flex">
          <Dropdown
            label="Services"
            open={openMenu === "services"}
            onToggle={() => setOpenMenu((c) => (c === "services" ? null : "services"))}
            onClose={() => setOpenMenu(null)}
          >
            {services.map((service) => (
              <MenuLink key={service.slug} href={`/services/${service.slug}`} onSelect={() => setOpenMenu(null)}>
                <span className="block font-medium text-white">{service.name}</span>
                <span className="mt-0.5 block text-xs text-white/45">{service.tagline}</span>
              </MenuLink>
            ))}
            <div className="my-1.5 h-px bg-white/10" />
            <MenuLink href="/services" onSelect={() => setOpenMenu(null)}>
              <span className="font-medium text-violet-200">All service offerings</span>
            </MenuLink>
          </Dropdown>

          <Dropdown
            label="About"
            open={openMenu === "about"}
            onToggle={() => setOpenMenu((c) => (c === "about" ? null : "about"))}
            onClose={() => setOpenMenu(null)}
          >
            {ABOUT_LINKS.map((link) => (
              <MenuLink key={link.href} href={link.href} onSelect={() => setOpenMenu(null)}>
                <span className="font-medium text-white">{link.label}</span>
              </MenuLink>
            ))}
          </Dropdown>

          <Link href="/blog" className="rounded-lg px-3 py-2 transition hover:text-white">Blog</Link>
          <a href="tel:+18023103749" className="rounded-lg px-3 py-2 transition hover:text-white">Call us</a>
        </div>

        {/* Deliberately not a PeekButton. The nav is pinned to the top of the viewport, so
            there is no headroom above it for Arki to rise into — he'd be clipped off-screen.
            He lives on in-page CTAs, which have space above them. */}
        <button
          type="button"
          onClick={onStartProject}
          className="hidden rounded-full bg-white px-6 py-2.5 text-sm font-semibold tracking-tight text-[#0c0c18] transition hover:bg-white/90 active:scale-[0.98] lg:block"
        >
          Get a quote
        </button>

        {/* mobile trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-xl border border-white/15 bg-white/10 p-2.5 text-white transition hover:bg-white/20 lg:hidden"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* mobile panel */}
      {mobileOpen ? (
        <div id="mobile-nav" className="max-h-[calc(100svh-72px)] overflow-y-auto border-t border-white/10 px-5 pb-8 pt-4 lg:hidden">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Services</p>
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-3 py-3 text-[15px] text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              {service.name}
              <span className="mt-0.5 block text-xs text-white/40">{service.tagline}</span>
            </Link>
          ))}
          <Link href="/services" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-3 text-[15px] font-medium text-violet-200">
            All service offerings
          </Link>

          <div className="my-3 h-px bg-white/10" />
          {[...ABOUT_LINKS, { href: "/blog", label: "Blog" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-3 py-3 text-[15px] text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => { setMobileOpen(false); onStartProject?.(); }}
            className="mt-4 w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0c0c18]"
          >
            Get a quote
          </button>
        </div>
      ) : null}
    </motion.nav>
  );
}

function Dropdown({
  label, open, onToggle, onClose, children,
}: {
  label: string; open: boolean; onToggle: () => void; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${open ? "text-white" : "hover:text-white"}`}
      >
        {label}
        <ChevronDown size={15} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          className="absolute left-0 top-[calc(100%+10px)] w-72 rounded-2xl border border-white/10 bg-[#121220f5] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, onSelect, children }: { href: string; onSelect: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onSelect} className="block rounded-xl px-3 py-2.5 transition hover:bg-white/[0.07]">
      {children}
    </Link>
  );
}
