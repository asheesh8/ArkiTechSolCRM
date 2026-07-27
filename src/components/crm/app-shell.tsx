"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Headphones,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  NotebookText,
  Search,
  Settings,
  Sparkles,
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
  "/clients": "Client relationships, active leads, assignments, and sales stages.",
  "/requests": "Delivery work, client requests, deadlines, and developer handoff.",
  "/analytics": "Traffic and conversion signals across ArkiTech properties.",
  "/calendar": "Meetings, follow-ups, and scheduled work.",
  "/notes": "Shared team notes, research, and client context.",
  "/settings": "Team members, access, and operating preferences.",
};

function LiquidLogo() {
  return (
    <span className="liquid-logo-mark" aria-hidden="true">
      <span>A</span>
    </span>
  );
}

export function AppShell({ children, user }: { children: React.ReactNode; user: ShellUser }) {
  const pathname = usePathname();
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

        <nav className="mt-5 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
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
                        "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50",
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
        </nav>

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
              {user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-[var(--muted)]">{ROLE_LABELS[user.role] ?? user.role}</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur-2xl">
          <div className="flex min-h-20 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 2xl:px-10">
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
          <nav className="flex w-full max-w-full gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
            {flatNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 shrink-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-xs font-semibold text-zinc-600 dark:text-zinc-300",
                    active && "bg-[linear-gradient(135deg,var(--accent),var(--brand-emerald))] text-[var(--accent-foreground)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {labelFor(item)}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="w-full px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
