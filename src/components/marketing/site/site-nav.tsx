"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { CaretDown, List, Phone, X } from "@phosphor-icons/react";
import { Lockup } from "@/components/marketing/brand/mark";
import { Plate } from "@/components/marketing/art/plate";
import { useContact } from "@/components/marketing/site/contact-context";
import { ThemeToggle } from "@/components/marketing/site/theme-toggle";
import { services } from "@/lib/services-content";
import { SERVICE_PLATE } from "@/lib/marketing/art";
import { ABOUT_LINKS, SITE } from "@/lib/marketing/site";

/**
 * Transparent over the Burlington footage on the home page, solid paper
 * everywhere else and once the page has moved. Slides away on scroll down,
 * returns on scroll up, and never hides while a menu is open or focused.
 */
export function SiteNav() {
  const pathname = usePathname();
  const { open: openContact } = useContact();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const navRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  const [menu, setMenu] = useState<"services" | "about" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [overHero, setOverHero] = useState(pathname === "/");

  const pinned = menu !== null || mobile;

  useEffect(() => {
    setOverHero(pathname === "/" && window.scrollY < window.innerHeight * 0.82);
    setMobile(false);
    setMenu(null);
  }, [pathname]);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (pathname === "/") setOverHero(y < window.innerHeight * 0.82);
    const delta = y - lastY.current;
    if (pinned || y < 80) {
      setHidden(false);
      lastY.current = y;
      return;
    }
    if (Math.abs(delta) < 8) return;
    setHidden(delta > 0);
    lastY.current = y;
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(null);
        setMobile(false);
      }
    }
    function onPointer(e: PointerEvent) {
      if (!navRef.current?.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  const transparent = overHero && !pinned;

  return (
    <motion.header
      ref={navRef}
      initial={false}
      animate={{ y: hidden ? "-105%" : "0%" }}
      transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      onFocusCapture={() => setHidden(false)}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300 ${
        transparent ? "band-night border-transparent !bg-transparent" : "border-[var(--rule)] bg-[var(--bg)]"
      }`}
    >
      <div className="shell flex h-[var(--nav-h)] items-center justify-between gap-6">
        <Link href="/" aria-label="ArkiTech Solutions, home" className="shrink-0 text-[var(--fg)]">
          <Lockup compact />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          <Dropdown
            label="Services"
            open={menu === "services"}
            onToggle={() => setMenu((m) => (m === "services" ? null : "services"))}
            wide
          >
            <ul className="grid gap-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    onClick={() => setMenu(null)}
                    className="group flex items-center gap-4 px-3 py-3 transition-colors duration-150 hover:bg-[var(--bg-2)]"
                  >
                    <span className="flex h-12 w-14 shrink-0 items-center justify-center">
                      <Plate name={SERVICE_PLATE[s.slug]} className="max-h-12 w-full opacity-80" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-[var(--fg)]">{s.name}</span>
                      <span className="block text-sm text-[var(--dim)]">{s.tagline}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/services"
              onClick={() => setMenu(null)}
              className="mt-2 flex items-center justify-between border-t border-[var(--rule)] px-3 pt-3 text-sm font-medium text-[var(--fg)] hover:text-[var(--accent-text)]"
            >
              All services <span aria-hidden="true">→</span>
            </Link>
          </Dropdown>

          <Dropdown
            label="About"
            open={menu === "about"}
            onToggle={() => setMenu((m) => (m === "about" ? null : "about"))}
          >
            <ul className="grid">
              {ABOUT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMenu(null)}
                    className="block px-3 py-2.5 text-[var(--fg)] transition-colors duration-150 hover:bg-[var(--bg-2)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Dropdown>

          <NavLink href="/pricing" active={pathname === "/pricing"}>Pricing</NavLink>
          <NavLink href="/faq" active={pathname === "/faq"}>FAQ</NavLink>
          <NavLink href="/blog" active={pathname.startsWith("/blog")}>Blog</NavLink>
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={SITE.phoneHref}
            className="figure hidden items-center gap-2 px-2 text-[0.86rem] text-[var(--fg)] transition-colors hover:text-[var(--accent-text)] xl:inline-flex"
          >
            <Phone size={15} aria-hidden="true" />
            {SITE.phone}
          </a>
          <ThemeToggle />
          <button type="button" onClick={openContact} className="ak-btn ak-btn-primary ak-btn-sm hidden sm:inline-flex">
            Book a free call
          </button>
          <button
            type="button"
            onClick={() => setMobile((v) => !v)}
            aria-expanded={mobile}
            aria-controls="mobile-menu"
            aria-label={mobile ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--rule-strong)] text-[var(--fg)] lg:hidden"
          >
            {mobile ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {mobile ? (
        <div
          id="mobile-menu"
          className="max-h-[calc(100dvh-var(--nav-h))] overflow-y-auto border-t border-[var(--rule)] bg-[var(--bg)] lg:hidden"
        >
          <div className="shell pb-10 pt-6">
            <p className="text-sm text-[var(--dim)]">Services</p>
            <ul className="mt-2 border-t border-[var(--rule)]">
              {services.map((s) => (
                <li key={s.slug} className="border-b border-[var(--rule)]">
                  <Link href={`/services/${s.slug}`} onClick={() => setMobile(false)} className="flex items-center gap-4 py-3.5">
                    <Plate name={SERVICE_PLATE[s.slug]} className="h-10 w-12 shrink-0 opacity-80" />
                    <span>
                      <span className="ak-display block text-[1.35rem]">{s.name}</span>
                      <span className="block text-sm text-[var(--dim)]">{s.tagline}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 grid grid-cols-2 gap-x-6">
              {[...ABOUT_LINKS, { href: "/pricing", label: "Pricing" }, { href: "/faq", label: "FAQ" }, { href: "/blog", label: "Blog" }, { href: "/services", label: "All services" }].map((l) => (
                <li key={l.href + l.label} className="border-b border-[var(--rule)]">
                  <Link href={l.href} onClick={() => setMobile(false)} className="block py-3 text-[1.02rem]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobile(false);
                  openContact();
                }}
                className="ak-btn ak-btn-primary w-full"
              >
                Book a free call
              </button>
              <a href={SITE.phoneHref} className="ak-btn ak-btn-ghost w-full">
                <Phone size={16} aria-hidden="true" /> Call {SITE.phone}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </motion.header>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="relative py-2 text-[0.96rem] text-[var(--fg)] transition-colors duration-150 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--lamp)] after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
    >
      {children}
    </Link>
  );
}

function Dropdown({
  label,
  open,
  onToggle,
  wide = false,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-1.5 py-2 text-[0.96rem] text-[var(--fg)]"
      >
        {label}
        <CaretDown size={12} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute left-1/2 top-[calc(100%+1.1rem)] border border-[var(--rule)] bg-[var(--bg)] p-2 text-[var(--fg)] shadow-[var(--shadow)] ${
            wide ? "w-[27rem]" : "w-60"
          }`}
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}
