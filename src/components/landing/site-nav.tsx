"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
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
 *
 * Transparent over the hero, solid ink once the page has moved. The bar never
 * blurs what is behind it: frosted glass is the house style of every SaaS
 * template, and one flat edge reads far more expensive.
 */
export function SiteNav({ onStartProject }: { onStartProject?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);
  const navRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const pinned = openMenu !== null || mobileOpen;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
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

  const solid = scrolled || pinned;

  return (
    <motion.nav
      ref={navRef}
      initial={false}
      animate={{ y: visible ? 0 : "-110%" }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      onFocusCapture={() => setVisible(true)}
      className="fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300"
      style={{
        borderColor: solid ? "var(--rule)" : "rgba(236,233,227,0.12)",
        background: solid ? "#0a0a0e" : "transparent",
        ["--rule" as string]: "rgba(236,233,227,0.56)",
      }}
    >
      <div className="mx-auto flex h-[var(--nav-h,5.25rem)] max-w-[84rem] items-center justify-between gap-6 px-[var(--page-pad,1.5rem)]">
        <Wordmark />

        {/* desktop */}
        <div className="hidden items-center gap-9 lg:flex">
          <Dropdown
            label="Services"
            open={openMenu === "services"}
            onToggle={() => setOpenMenu((c) => (c === "services" ? null : "services"))}
            onClose={() => setOpenMenu(null)}
          >
            {services.map((service, i) => (
              <MenuLink key={service.slug} href={`/services/${service.slug}`} onSelect={() => setOpenMenu(null)}>
                <span className="figure-index shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block text-[0.95rem] font-medium" style={{ color: "var(--bone)" }}>{service.name}</span>
                  <span className="mt-0.5 block text-xs" style={{ color: "var(--dim)" }}>{service.tagline}</span>
                </span>
              </MenuLink>
            ))}
            <MenuLink href="/services" onSelect={() => setOpenMenu(null)}>
              <span className="figure-index shrink-0">↗</span>
              <span className="mono" style={{ color: "var(--violet-lift)" }}>All service offerings</span>
            </MenuLink>
          </Dropdown>

          <Dropdown
            label="About"
            open={openMenu === "about"}
            onToggle={() => setOpenMenu((c) => (c === "about" ? null : "about"))}
            onClose={() => setOpenMenu(null)}
          >
            {ABOUT_LINKS.map((link, i) => (
              <MenuLink key={link.href} href={link.href} onSelect={() => setOpenMenu(null)}>
                <span className="figure-index shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[0.95rem] font-medium" style={{ color: "var(--bone)" }}>{link.label}</span>
              </MenuLink>
            ))}
          </Dropdown>

          <Link href="/blog" className="nav-link">Blog</Link>
          <a href="tel:+18023103749" className="nav-link">Call us</a>
        </div>

        <button
          type="button"
          onClick={onStartProject}
          className="btn btn-outline hidden lg:inline-flex"
          style={{ minHeight: "2.85rem", padding: "0.55rem 1.15rem", borderColor: "rgba(236,233,227,0.4)" }}
        >
          Get a quote
        </button>

        {/* mobile trigger — a hamburger drawn in rules, not an icon font */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] border lg:hidden"
          style={{ borderColor: "var(--rule)" }}
        >
          <span
            className="block h-px w-5 transition-transform duration-200"
            style={{ background: "var(--bone)", transform: mobileOpen ? "translateY(3px) rotate(45deg)" : "none" }}
          />
          <span
            className="block h-px w-5 transition-transform duration-200"
            style={{ background: "var(--bone)", transform: mobileOpen ? "translateY(-3px) rotate(-45deg)" : "none" }}
          />
        </button>
      </div>

      {/* mobile panel */}
      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="max-h-[calc(100svh-var(--nav-h,5.25rem))] overflow-y-auto border-t px-[var(--page-pad,1.5rem)] pb-10 pt-6 lg:hidden"
          style={{ borderColor: "var(--rule)", background: "#0a0a0e" }}
        >
          <p className="eyebrow">Services</p>
          <div className="ledger" style={{ borderTopColor: "var(--rule)" }}>
            {services.map((service, i) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                onClick={() => setMobileOpen(false)}
                className="ledger-row"
                style={{ gridTemplateColumns: "2.5rem 1fr auto", padding: "1rem 0" }}
              >
                <span className="figure-index">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-[1.05rem]" style={{ fontStretch: "86%", fontWeight: 560 }}>{service.name}</span>
                  <span className="mt-0.5 block text-xs" style={{ color: "var(--dim)" }}>{service.tagline}</span>
                </span>
                <span className="ledger-row__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
            <Link
              href="/services"
              onClick={() => setMobileOpen(false)}
              className="ledger-row mono"
              style={{ gridTemplateColumns: "2.5rem 1fr auto", padding: "1rem 0", color: "var(--violet-lift)" }}
            >
              <span aria-hidden="true" />
              <span>All service offerings</span>
              <span className="ledger-row__arrow" aria-hidden="true">↗</span>
            </Link>
          </div>

          <p className="eyebrow mt-9">Studio</p>
          <div className="ledger" style={{ borderTopColor: "var(--rule)" }}>
            {[...ABOUT_LINKS, { href: "/blog", label: "Blog" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="ledger-row"
                style={{ gridTemplateColumns: "1fr auto", padding: "0.95rem 0" }}
              >
                <span className="text-[1.05rem]" style={{ fontStretch: "86%", fontWeight: 560 }}>{link.label}</span>
                <span className="ledger-row__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { setMobileOpen(false); onStartProject?.(); }}
            className="btn btn-solid mt-8 w-full"
          >
            Get a quote
          </button>
        </div>
      ) : null}
    </motion.nav>
  );
}

/**
 * Typographic wordmark.
 *
 * Replaces the banner PNG, which could only sit on the dark bar inside a white
 * rounded chip with a drop shadow — the one element on the page that gave the
 * template away. Set as live text it matches the logo's own two-tone structure,
 * stays crisp at any size, and costs no image request.
 */
function Wordmark() {
  return (
    <Link href="/" aria-label="ArkiTech Solutions home" className="group shrink-0">
      <span
        className="block leading-none"
        style={{ fontStretch: "78%", fontWeight: 700, fontSize: "1.32rem", letterSpacing: "-0.035em" }}
      >
        ArkiTech<span style={{ color: "var(--violet-lift)" }}> Solutions</span>
      </span>
      <span className="mono mt-1 block" style={{ fontSize: "0.56rem", letterSpacing: "0.24em", color: "rgba(236,233,227,0.56)" }}>
        Digital Product Studio
      </span>
    </Link>
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
        className="nav-link"
        data-open={open || undefined}
      >
        {label}
      </button>
      {open ? (
        <div
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          className="absolute left-0 top-[calc(100%+1.15rem)] w-[21rem] border p-1"
          style={{ borderColor: "var(--rule)", background: "#0a0a0e" }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, onSelect, children }: { href: string; onSelect: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-start gap-3.5 px-4 py-3 transition-colors duration-150 hover:bg-[rgba(236,233,227,0.56)]"
    >
      {children}
    </Link>
  );
}
