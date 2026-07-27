import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClasses = {
  cyan: "text-cyan-700 dark:text-cyan-300 bg-cyan-500/10",
  emerald: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10",
  amber: "text-amber-700 dark:text-amber-300 bg-amber-500/10",
  rose: "text-rose-700 dark:text-rose-300 bg-rose-500/10",
  zinc: "text-zinc-700 dark:text-zinc-300 bg-zinc-500/10",
};

type Tone = keyof typeof toneClasses;

export function MetricTile({
  icon: Icon,
  label,
  value,
  detail,
  tone = "zinc",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("crm-card rounded-lg border p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
          <div className="mt-2 text-2xl font-bold tabular-nums text-zinc-950 dark:text-zinc-50">{value}</div>
        </div>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {detail ? <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{detail}</p> : null}
    </div>
  );
}
