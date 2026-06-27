"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, LogOut, MessageSquarePlus } from "lucide-react";

type Props = {
  client: { name: string; businessName: string; email: string };
  children: React.ReactNode;
};

const NAV = [
  { href: "/portal", label: "Dashboard", icon: Home },
  { href: "/portal/requests", label: "Requests", icon: MessageSquarePlus },
  { href: "/portal/invoices", label: "Invoices & Billing", icon: FileText },
];

export default function PortalShell({ client, children }: Props) {
  const pathname = usePathname();

  const initials = client.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold tracking-tight">
              Arki<span className="text-indigo-600">Tech</span>
            </span>
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    pathname === href ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{initials}</div>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold leading-none text-zinc-900">{client.businessName}</p>
                <p className="text-xs text-zinc-500">{client.email}</p>
              </div>
            </div>
            <form action="/api/portal/logout" method="POST">
              <button type="submit" title="Sign out" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="flex border-t border-zinc-100 sm:hidden">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium ${pathname === href ? "text-indigo-700" : "text-zinc-500"}`}>
              <Icon className="h-5 w-5" /> {label}
            </Link>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-400">
        ArkiTech Solutions Client Portal · <a href="mailto:hello@arkitechsol.com" className="hover:underline">hello@arkitechsol.com</a>
      </footer>
    </div>
  );
}
