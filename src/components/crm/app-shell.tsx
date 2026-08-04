"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Headphones,
  Inbox,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoreHorizontal,
  NotebookText,
  Search,
  Settings,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/crm/theme-toggle";
import { LogoutButton } from "@/components/crm/logout-button";
import { ScrapeQuotaWidget } from "@/components/crm/scrape-quota-widget";
import { StatsTicker } from "@/components/crm/stats-ticker";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
};

type NavSection = { label: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    label: "Pipeline",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/accountability", label: "Accountability", icon: ClipboardCheck, roles: ["OWNER", "MEMBER"] },
      { href: "/leads", label: "Leads / Scraper", icon: Search, roles: ["OWNER", "MEMBER"] },
      { href: "/outreach", label: "Cold Text", icon: MessageSquare, roles: ["OWNER", "MEMBER"] },
    ],
  },
  {
    label: "Clients & Work",
    items: [
      { href: "/receptionist", label: "AI Receptionist", icon: Headphones, roles: ["OWNER"] },
      { href: "/agents", label: "Agents", icon: Bot, roles: ["OWNER"] },
      { href: "/clients", label: "CRM Clients", icon: Building2, roles: ["OWNER", "MEMBER"] },
      { href: "/requests", label: "Work Requests", icon: Inbox, roles: ["OWNER", "DEV"] },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["OWNER"] },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/notes", label: "Notes", icon: NotebookText },
      { href: "/settings", label: "Team", icon: Settings, roles: ["OWNER"] },
    ],
  },
];

type ShellUser = {
  name: string;
  email: string;
  role: string;
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Manager",
  DEV: "Developer",
  MEMBER: "Agent",
};

const PAGE_DETAILS: Record<string, string> = {
  "/dashboard": "Action items, delivery signals, and live pipeline movement.",
  "/accountability": "Team ownership, follow-through, and calling rhythm.",
  "/leads": "Find high-fit local businesses and move winners into the CRM.",
  "/outreach": "Cold text workflows for timely follow-up.",
  "/receptionist": "AI call handling, conversations, and intake quality.",
  "/agents": "Voice agents, client assignments, and public demo links.",
  "/clients": "Client relationships, active leads, assignments, and sales stages.",
  "/requests": "Delivery work, client requests, deadlines, and developer handoff.",
  "/analytics": "Traffic and conversion signals across ArkiTech properties.",
  "/calendar": "Meetings, follow-ups, and scheduled work.",
  "/notes": "Shared team notes, research, and client context.",
  "/settings": "Team members, access, and operating preferences.",
};

// Order the bottom tab bar picks from. Whichever four the signed-in role can
// actually see become the thumb-reachable tabs; everything else lives in the
// drawer behind "More".
const MOBILE_TAB_PRIORITY = ["/dashboard", "/leads", "/clients", "/outreach", "/requests", "/calendar", "/notes"];

// Short labels — the full nav labels ("Leads / Scraper") don't fit a fifth of a
// phone screen.
const MOBILE_TAB_LABELS: Record<string, string> = {
  "/dashboard": "Home",
  "/leads": "Leads",
  "/clients": "Clients",
  "/outreach": "Text",
  "/requests": "Work",
  "/calendar": "Calendar",
  "/notes": "Notes",
  "/receptionist": "Calls",
  "/agents": "Agents",
  "/analytics": "Stats",
  "/accountability": "Today",
  "/settings": "Team",
};

function LiquidLogo() {
  return (
    <span className="liquid-logo-mark" aria-hidden="true">
      <span>A</span>
    </span>
  );
}

function initialsOf(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function AppShell({ children, user }: { children: React.ReactNode; user: ShellUser }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const canSee = (item: NavItem) => !item.roles || item.roles.includes(user.role);
  const labelFor = (item: NavItem) => (item.href === "/requests" && user.role === "DEV" ? "My Work" : item.label);

  const visibleSections = navSections
    .map((section) => ({ ...section, items: section.items.filter(canSee) }))
    .filter((section) => section.items.length > 0);
  const flatNav = visibleSections.flatMap((section) => section.items);
  const activeItem = flatNav.find((item) => isActive(item.href)) ?? flatNav[0];
  const activeSection = visibleSections.find((section) => section.items.some((item) => item.href === activeItem?.href));
  const pageTitle = activeItem ? labelFor(activeItem) : "Workspace";
  const pageDescription = PAGE_DETAILS[activeItem?.href ?? ""] ?? "Manage the work that keeps the business moving.";

  const tabItems = MOBILE_TAB_PRIORITY
    .map((href) => flatNav.find((item) => item.href === href))
    .filter((item): item is NavItem => !!item)
    .slice(0, 4);
  // Anything not promoted to a tab still needs to look "current" somewhere, so
  // More lights up when the open page isn't one of the four tabs.
  const moreIsActive = !tabItems.some((item) => isActive(item.href));

  // Navigating from inside the drawer should dismiss it.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock the page behind the drawer, and let Escape close it.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const navList = (
    <>
      {visibleSections.map((section) => (
        <div key={section.label}>
          <p className="px-3 pb-2 text-[11px] font-semibold text-[var(--muted)]">{section.label}</p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50 lg:h-10",
                    active && "bg-[var(--surface-strong)] text-zinc-950 shadow-sm ring-1 ring-[var(--border)] dark:text-zinc-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition group-hover:text-[var(--accent)]",
                      active && "bg-[linear-gradient(135deg,var(--accent),var(--brand-emerald))] text-[var(--accent-foreground)] group-hover:text-[var(--accent-foreground)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{labelFor(item)}</span>
                  {active && <ChevronRight className="ml-auto h-4 w-4 text-[var(--accent)]" />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="crm-app-background min-h-screen overflow-x-hidden bg-[var(--background)] text-zinc-950 dark:text-zinc-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-[var(--border)] bg-[var(--surface)] backdrop-blur-2xl lg:flex">
        <div className="px-4 pt-4">
          <Link href="/dashboard" className="crm-card-strong flex items-center gap-3 rounded-lg border p-3">
            <LiquidLogo />
            <span className="min-w-0">
              <span className="block text-sm font-semibold">ArkiTech CRM</span>
              <span className="block truncate text-xs text-[var(--muted)]">Growth and delivery OS</span>
            </span>
          </Link>
        </div>

        <nav className="mt-5 flex-1 space-y-5 overflow-y-auto px-4 pb-4">{navList}</nav>

        <div className="m-4 space-y-3">
          <div className="crm-card rounded-lg border p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-[var(--brand-amber)]" />
              Pipeline focus
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Work high-rating businesses with weak web presence, then move the best fit into delivery cleanly.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-950">
              {initialsOf(user.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-[var(--muted)]">{ROLE_LABELS[user.role] ?? user.role}</span>
            </span>
          </div>
        </div>
      </aside>

      {/* ── Mobile / tablet nav drawer ── */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        id="crm-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        inert={!menuOpen ? true : undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-xs flex-col border-r border-[var(--border)] bg-[var(--surface-strong)] backdrop-blur-2xl transition-transform duration-300 ease-out lg:hidden",
          menuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="pt-safe">
          <div className="flex items-center gap-3 px-4 py-3">
            <LiquidLogo />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">ArkiTech CRM</span>
              <span className="block truncate text-xs text-[var(--muted)]">Growth and delivery OS</span>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-zinc-500 active:scale-95 dark:text-zinc-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 pb-4">{navList}</nav>

        <div className="border-t border-[var(--border)] px-4 pt-3 pb-safe">
          <div className="flex items-center gap-3 pb-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-950">
              {initialsOf(user.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-[var(--muted)]">{ROLE_LABELS[user.role] ?? user.role}</span>
            </span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        {/* The header scrolls away on phones — a pinned title bar plus the stats
            ticker would eat ~100px of a 390×844 screen, and the bottom tab bar
            already keeps navigation one thumb away. It stays pinned at lg. */}
        <header className="border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur-2xl lg:sticky lg:top-0 lg:z-10">
          {/* Mobile / tablet bar */}
          <div className="pt-safe lg:hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation"
                aria-expanded={menuOpen}
                aria-controls="crm-mobile-nav"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] text-zinc-600 active:scale-95 dark:text-zinc-300"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-[var(--muted)]">
                  {activeSection?.label ?? "Workspace"} · {ROLE_LABELS[user.role] ?? user.role}
                </p>
                <h1 className="truncate text-base font-semibold leading-tight">{pageTitle}</h1>
              </div>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>

          {/* Desktop bar */}
          <div className="hidden min-h-20 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:flex lg:px-8 2xl:px-10">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                <span>{activeSection?.label ?? "Workspace"}</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span>{ROLE_LABELS[user.role] ?? user.role}</span>
              </div>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-normal">{pageTitle}</h1>
              <p className="mt-1 hidden max-w-2xl truncate text-sm text-[var(--muted)] md:block">{pageDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <ScrapeQuotaWidget />
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>

          {user.role !== "DEV" && (
            <div className="overflow-hidden border-t border-[var(--border)]">
              <div className="w-full">
                <StatsTicker />
              </div>
            </div>
          )}
        </header>

        <main className="w-full px-3 py-4 sm:px-6 sm:py-5 lg:px-8 2xl:px-10">
          <div>{children}</div>
        </main>

        {/* Runs under the fixed tab bar so the last row of content stays reachable. */}
        <div aria-hidden="true" className="pb-safe lg:hidden">
          <div className="h-[var(--crm-tabbar-height)]" />
        </div>
      </div>

      {/* ── Mobile / tablet bottom tab bar ── */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] backdrop-blur-2xl pb-safe lg:hidden"
      >
        <div className="mx-auto grid h-[var(--crm-tabbar-height)] max-w-2xl grid-cols-5">
          {tabItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition active:scale-95",
                  active ? "text-[var(--accent)]" : "text-zinc-500 dark:text-zinc-400",
                )}
              >
                {active && (
                  <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--brand-emerald))]" />
                )}
                <Icon className="h-5 w-5" />
                <span className="truncate px-1">{MOBILE_TAB_LABELS[item.href] ?? labelFor(item)}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            aria-controls="crm-mobile-nav"
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition active:scale-95",
              moreIsActive ? "text-[var(--accent)]" : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {moreIsActive && (
              <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--brand-emerald))]" />
            )}
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
