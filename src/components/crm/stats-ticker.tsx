"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  totalLeads: number;
  callsMadeToday: number;
  meetingsBooked: number;
  followUpsDue: number;
  closeRate: number;
};

const PILLS = [
  { key: "totalLeads" as const, label: "Leads", href: "/clients", color: "text-zinc-400" },
  { key: "callsMadeToday" as const, label: "Calls today", href: "/clients?status=CALLED", color: "text-emerald-400" },
  { key: "meetingsBooked" as const, label: "Meetings", href: "/clients?status=MEETING_BOOKED", color: "text-sky-400" },
  { key: "followUpsDue" as const, label: "Follow-ups due", href: "/clients?status=FOLLOW_UP", color: "text-amber-400" },
  { key: "closeRate" as const, label: "Close rate", href: "/clients?status=CLOSED", color: "text-violet-400", suffix: "%" },
];

export function StatsTicker() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats);
  }, []);

  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {PILLS.map((pill, i) => {
        const value = stats ? stats[pill.key] : null;
        return (
          <Link
            key={pill.key}
            href={pill.href}
            className="group flex shrink-0 items-center gap-2 border-r border-zinc-200 px-4 py-2 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 first:border-l"
          >
            <span className={`text-sm font-semibold tabular-nums ${pill.color} ${value === null ? "opacity-40" : ""}`}>
              {value === null ? "—" : `${value}${pill.suffix ?? ""}`}
            </span>
            <span className="text-xs text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
              {pill.label}
            </span>
            {i < PILLS.length - 1 && (
              <span className="ml-1 text-zinc-300 dark:text-zinc-700">·</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
