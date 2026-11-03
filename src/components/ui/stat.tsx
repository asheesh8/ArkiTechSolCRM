import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { Sparkline } from "./sparkline";

/**
 * A key figure. One line of mono label, one serif number, one line of
 * context. Four of these across the top of a page is the limit.
 */
export function Stat({
  label,
  value,
  hint,
  trend,
  spark,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** Positive is good unless `invert`. */
  trend?: { value: number; invert?: boolean; suffix?: string } | null;
  /** Up to ~30 points; drawn as a small line on the right. */
  spark?: number[];
  className?: string;
}) {
  const up = trend ? (trend.invert ? trend.value < 0 : trend.value > 0) : null;
  return (
    <Card className={cn("flex flex-col gap-1 px-4 py-3.5", className)}>
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">{label}</div>
      <div className="flex items-end justify-between gap-3">
        <div className="tnum font-serif text-2xl leading-none text-text">{value}</div>
        {spark?.length ? <Sparkline values={spark} tone={up === null ? "neutral" : up ? "success" : "danger"} /> : null}
      </div>
      {(hint || trend) && (
        <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
          {trend ? (
            <span className={cn("tnum font-medium", up === null ? "" : up ? "text-success" : "text-danger")}>
              {trend.value > 0 ? "+" : ""}
              {trend.value}
              {trend.suffix ?? "%"}
            </span>
          ) : null}
          {hint}
        </div>
      )}
    </Card>
  );
}

export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>{children}</div>;
}
