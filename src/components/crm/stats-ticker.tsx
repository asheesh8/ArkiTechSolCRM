"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, CalendarCheck, PhoneCall, Target, Users } from "lucide-react";

type Stats = {
  totalLeads: number;
  callsMadeToday: number;
  meetingsBooked: number;
  followUpsDue: number;
  closeRate: number;
};

const PILLS = [
  { key: "totalLeads" as const, label: "Leads", href: "/clients", color: "text-zinc-500 dark:text-zinc-300", icon: Users },
  { key: "callsMadeToday" as const, label: "Calls today", href: "/clients?status=CALLED", color: "text-emerald-600 dark:text-emerald-300", icon: PhoneCall },
  { key: "meetingsBooked" as const, label: "Meetings", href: "/clients?status=MEETING_BOOKED", color: "text-cyan-700 dark:text-cyan-300", icon: CalendarCheck },
  { key: "followUpsDue" as const, label: "Follow-ups due", href: "/clients?status=FOLLOW_UP", color: "text-amber-700 dark:text-amber-300", icon: Target },
  { key: "closeRate" as const, label: "Close rate", href: "/clients?status=CLOSED", color: "text-rose-700 dark:text-rose-300", suffix: "%", icon: BarChart3 },
];

export function StatsTicker() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats);
  }, []);

  return (
    <div className="crm-rail scrollbar-none flex w-full max-w-full items-center gap-2 overflow-x-auto px-3 py-2 sm:px-6 lg:px-8">
      {PILLS.map((pill) => {
        const value = stats ? stats[pill.key] : null;
        const Icon = pill.icon;
        return (
          <Link
            key={pill.key}
            href={pill.href}
            className="group flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 transition active:scale-95 hover:bg-white dark:hover:bg-white/10"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900/5 text-[var(--muted)] dark:bg-white/10">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className={`text-sm font-bold tabular-nums ${pill.color} ${value === null ? "opacity-40" : ""}`}>
              {value === null ? "—" : `${value}${pill.suffix ?? ""}`}
            </span>
            <span className="text-xs font-medium text-[var(--muted)] group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
              {pill.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
