"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, Gauge, LayoutDashboard, Search, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/crm/theme-toggle";
import { LogoutButton } from "@/components/crm/logout-button";
import { ScrapeQuotaWidget } from "@/components/crm/scrape-quota-widget";
import { StatsTicker } from "@/components/crm/stats-ticker";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads/Scraper", icon: Search },
  { href: "/clients", label: "CRM Clients", icon: Building2 },
  { href: "/audits", label: "PageSpeed Audit", icon: Gauge },
  { href: "/settings", label: "Settings", icon: Settings },
];

type ShellUser = {
  name: string;
  email: string;
  role: string;
};

export function AppShell({ children, user }: { children: React.ReactNode; user: ShellUser }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-zinc-200 bg-white/95 px-4 py-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">LocalLead CRM</span>
            <span className="block text-xs text-zinc-500">Ashish + Terri workspace</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
                  active && "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <div className="flex items-center gap-2 font-medium">
            <BarChart3 className="h-4 w-4" />
            Pipeline focus
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Prioritize low-review, high-rating businesses with weak or missing websites.
          </p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">LocalLead CRM</p>
              <h1 className="text-lg font-semibold">Local business growth desk</h1>
            </div>
            <div className="flex items-center gap-2">
              <ScrapeQuotaWidget />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-zinc-500">{user.role}</p>
              </div>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800">
            <StatsTicker />
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-medium text-zinc-600 dark:text-zinc-400",
                    active && "bg-[var(--accent)] text-[var(--accent-foreground)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
