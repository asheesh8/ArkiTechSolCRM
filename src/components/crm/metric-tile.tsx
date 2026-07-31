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
    <div className={cn("crm-card rounded-lg border p-3 sm:p-4", className)}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--muted)] sm:text-sm">{label}</p>
          <div className="mt-1 text-xl font-bold tabular-nums text-zinc-950 dark:text-zinc-50 sm:mt-2 sm:text-2xl">{value}</div>
        </div>
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10", toneClasses[tone])}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>
      {/* Two tiles per row on a phone leaves no space for the supporting copy. */}
      {detail ? <p className="mt-2 hidden text-xs leading-5 text-[var(--muted)] sm:mt-3 sm:block">{detail}</p> : null}
    </div>
  );
}
