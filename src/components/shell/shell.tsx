"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronsUpDown, LogOut, Menu, MoreHorizontal, Moon, Search, Settings, Sun, X } from "lucide-react";
import { MODULES, MODULE_BY_KEY, type ModuleKey } from "@/modules/registry";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/badge";
import { Mark } from "@/components/ui/brand";
import { CommandPalette } from "./command-palette";

export type ShellProps = {
  slug: string;
  workspace: { name: string; logoUrl?: string | null; poweredBy: boolean };
  user: { name: string; email: string; avatarUrl: string | null };
  modules: ModuleKey[];
  role: string;
  unread: number;
  /** Other workspaces this person belongs to, for the switcher. */
  switcher?: { slug: string; name: string }[];
  isStaff?: boolean;
  children: React.ReactNode;
};

/**
 * The inverted-L app shell: a dimmed 240px sidebar and a 56px top bar on
 * desktop, a bottom tab bar (4 modules + More) on phones. Nav shows only the
 * modules the workspace has; add-ons it doesn't have live on Billing.
 */
export function Shell({ slug, workspace, user, modules, role, unread, switcher, isStaff, children }: ShellProps) {
  const pathname = usePathname();
  const [menu, setMenu] = React.useState(false);
  const [more, setMore] = React.useState(false);
  const [palette, setPalette] = React.useState(false);
  const base = `/w/${slug}`;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  React.useEffect(() => {
    setMenu(false);
    setMore(false);
  }, [pathname]);

  const has = new Set(modules);
  const nav = MODULES.filter((m) => m.nav !== "hidden" && has.has(m.key));
  const primary = nav.filter((m) => m.nav === "primary");
  const secondary = nav.filter((m) => m.nav === "secondary");
  const isActive = (path: string) => (path === "" ? pathname === base : pathname.startsWith(base + path));

  // Phone tab bar: first four by nav order, the rest behind More.
  const tabs = nav.slice(0, 4);
  const moreItems = nav.slice(4);

  const NavLink = ({ m, dense }: { m: (typeof MODULES)[number]; dense?: boolean }) => (
    <Link
      href={base + m.path}
      aria-current={isActive(m.path) ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors duration-150",
        dense ? "h-8" : "h-9",
        isActive(m.path) ? "bg-control-active text-text font-medium" : "text-text-muted hover:bg-surface-hover hover:text-text",
      )}
    >
      <m.icon className="size-4 shrink-0" strokeWidth={1.75} />
      <span className="truncate">{m.label}</span>
    </Link>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-3">
        <WorkspaceSwitcher current={{ slug, name: workspace.name, logoUrl: workspace.logoUrl }} others={switcher ?? []} isStaff={isStaff} />
      </div>
      <div className="px-3 pb-2">
        <button
          onClick={() => setPalette(true)}
          className="flex h-8 w-full items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-sm text-text-faint hover:border-border-strong"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search</span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-3" aria-label="Modules">
        <SectionLabel>Workspace</SectionLabel>
        {primary.map((m) => (
          <NavLink key={m.key} m={m} />
        ))}
        {secondary.length ? <SectionLabel className="mt-3">More</SectionLabel> : null}
        {secondary.map((m) => (
          <NavLink key={m.key} m={m} dense />
        ))}
        <div className="mt-auto pt-3">
          <Link
            href={`${base}/settings`}
            aria-current={isActive("/settings") ? "page" : undefined}
            className={cn("flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text", isActive("/settings") && "bg-control-active font-medium text-text")}
          >
            <Settings className="size-4" strokeWidth={1.75} /> Settings
          </Link>
        </div>
      </nav>
      <div className="border-t border-border p-2">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <Avatar name={user.name} src={user.avatarUrl} size={26} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium">{user.name}</div>
            <div className="truncate text-[11px] text-text-faint">{user.email}</div>
          </div>
        </div>
        {workspace.poweredBy ? (
          <div className="flex items-center gap-1.5 px-2 pb-1 pt-2 text-[11px] text-text-faint">
            <Mark size={12} /> Built and run by ArkiTech
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[var(--sidebar-w)] shrink-0 border-r border-border bg-bg-subtle md:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {menu ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal>
          <button aria-label="Close menu" className="fade-in absolute inset-0 bg-neutral-12/30" onClick={() => setMenu(false)} />
          <div className="relative h-full w-[280px] bg-bg-subtle shadow-lg animate-[drawer_220ms_var(--ease-out)_both]">
            <button onClick={() => setMenu(false)} aria-label="Close" className="absolute right-2 top-3 rounded-md p-2 text-text-muted">
              <X className="size-4" />
            </button>
            {sidebar}
          </div>
          <style>{`@keyframes drawer{from{transform:translateX(-16px);opacity:0}to{transform:none;opacity:1}}`}</style>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[var(--topbar-h)] items-center gap-2 border-b border-border bg-bg/85 px-3 backdrop-blur-sm sm:px-4">
          <button onClick={() => setMenu(true)} className="rounded-md p-2 text-text-muted hover:bg-surface-hover md:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2 md:hidden">
            {workspace.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={workspace.logoUrl} alt="" className="size-6 rounded-sm object-contain" />
            ) : null}
            <span className="truncate text-sm font-semibold">{workspace.name}</span>
          </div>

          <Breadcrumb slug={slug} pathname={pathname} />
          <button onClick={() => setPalette(true)} className="ml-auto rounded-md p-2 text-text-muted hover:bg-surface-hover md:hidden" aria-label="Search">
            <Search className="size-5" />
          </button>

          <Link href={`${base}/inbox`} className="relative rounded-md p-2 text-text-muted hover:bg-surface-hover" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
            <Bell className="size-[18px]" strokeWidth={1.75} />
            {unread ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-bg" /> : null}
          </Link>
          <div className="hidden flex-1 md:block" />
          <ThemeToggle />
          <UserMenu user={user} role={role} />
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+16px)] pt-5 sm:px-6 md:pb-10 md:pt-6">{children}</main>
      </div>

      {/* Phone tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden" aria-label="Primary">
        {tabs.map((m) => (
          <Link key={m.key} href={base + m.path} aria-current={isActive(m.path) ? "page" : undefined} className={cn("flex flex-1 flex-col items-center justify-center gap-1 text-[11px]", isActive(m.path) ? "text-text font-medium" : "text-text-muted")}>
            <m.icon className="size-5" strokeWidth={isActive(m.path) ? 2 : 1.6} />
            {m.label.split(" ")[0]}
          </Link>
        ))}
        <button onClick={() => setMore(true)} className={cn("flex flex-1 flex-col items-center justify-center gap-1 text-[11px]", more ? "text-text" : "text-text-muted")}>
          <MoreHorizontal className="size-5" strokeWidth={1.6} />
          More
        </button>
      </nav>
      {more ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal>
          <button aria-label="Close" className="fade-in absolute inset-0 bg-neutral-12/30" onClick={() => setMore(false)} />
          <div className="rise-in absolute inset-x-0 bottom-0 rounded-t-lg border-t border-border bg-surface p-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-lg">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-neutral-6" />
            <div className="grid grid-cols-1 gap-0.5">
              {moreItems.map((m) => (
                <NavLink key={m.key} m={m} />
              ))}
              <Link href={`${base}/settings`} className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-text-muted">
                <Settings className="size-4" strokeWidth={1.75} /> Settings
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <CommandPalette open={palette} onClose={() => setPalette(false)} slug={slug} modules={nav.map((m) => ({ key: m.key, label: m.label, href: base + m.path }))} />
    </div>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-2.5 pb-1 pt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint", className)}>{children}</div>;
}

function Breadcrumb({ slug, pathname }: { slug: string; pathname: string }) {
  const rest = pathname.replace(`/w/${slug}`, "");
  const first = rest.split("/").filter(Boolean)[0];
  const mod = MODULES.find((m) => m.path === `/${first}`);
  const label = mod?.label ?? (first ? first[0]!.toUpperCase() + first.slice(1) : "Overview");
  return (
    <div className="ml-auto hidden items-center gap-1.5 text-xs text-text-muted md:flex md:ml-0">
      <span>Workspace</span>
      <span className="text-text-faint">/</span>
      <span className="text-text">{label}</span>
      <span className="ml-auto" />
    </div>
  );
}

function WorkspaceSwitcher({ current, others, isStaff }: { current: { slug: string; name: string; logoUrl?: string | null }; others: { slug: string; name: string }[]; isStaff?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const canSwitch = others.length > 0 || isStaff;
  return (
    <div ref={ref} className="relative min-w-0 flex-1">
      <button
        onClick={() => canSwitch && setOpen((v) => !v)}
        className={cn("flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left", canSwitch && "hover:bg-surface-hover")}
        aria-haspopup={canSwitch ? "menu" : undefined}
        aria-expanded={open}
      >
        {current.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.logoUrl} alt="" className="size-6 rounded-sm object-contain" />
        ) : (
          <span className="flex size-6 items-center justify-center rounded-sm bg-accent text-[11px] font-semibold text-on-accent">{current.name[0]}</span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{current.name}</span>
        {canSwitch ? <ChevronsUpDown className="size-3.5 text-text-faint" /> : null}
      </button>
      {open ? (
        <div className="rise-in absolute left-0 right-0 top-full z-40 mt-1 rounded-md border border-border bg-surface p-1 shadow-md" role="menu">
          {others.map((w) => (
            <Link key={w.slug} href={`/w/${w.slug}`} className="block truncate rounded-sm px-2 py-1.5 text-sm hover:bg-surface-hover" role="menuitem">
              {w.name}
            </Link>
          ))}
          {isStaff ? (
            <Link href="/admin" className="mt-1 block border-t border-border px-2 pt-2 text-xs text-text-muted hover:text-text" role="menuitem">
              ArkiTech console →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = React.useState<boolean | null>(null);
  React.useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    document.cookie = `theme=${next ? "dark" : "light"};path=/;max-age=31536000;samesite=lax`;
    setDark(next);
  };
  return (
    <button onClick={toggle} className="rounded-md p-2 text-text-muted hover:bg-surface-hover" aria-label="Toggle theme">
      {dark ? <Sun className="size-[18px]" strokeWidth={1.75} /> : <Moon className="size-[18px]" strokeWidth={1.75} />}
    </button>
  );
}

function UserMenu({ user, role }: { user: ShellProps["user"]; role: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="ml-1 flex items-center rounded-full ring-offset-2 hover:ring-2 hover:ring-border" aria-haspopup="menu" aria-expanded={open} aria-label="Account">
        <Avatar name={user.name} src={user.avatarUrl} size={28} />
      </button>
      {open ? (
        <div className="rise-in absolute right-0 top-full z-40 mt-2 w-56 rounded-md border border-border bg-surface p-1 shadow-md" role="menu">
          <div className="px-2 py-1.5">
            <div className="truncate text-sm font-medium">{user.name}</div>
            <div className="truncate text-xs text-text-muted">{user.email}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-faint">{role}</div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text" role="menuitem">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export { MODULE_BY_KEY };
