import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "text-text-muted before:bg-neutral-8",
  accent: "text-accent-text before:bg-accent",
  success: "text-success before:bg-success",
  warning: "text-warning before:bg-warning",
  danger: "text-danger before:bg-danger",
};

/**
 * Status as a dot and a word, never a filled pill. The accent dot means
 * "waiting on you"; the client learns that in a week.
 */
export function Badge({ tone = "neutral", className, children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium before:size-1.5 before:shrink-0 before:rounded-full",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** A small label chip for tags and counts. */
export function Chip({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex h-5 items-center rounded-sm border border-border bg-bg-subtle px-1.5 font-mono text-[11px] text-text-muted", className)}
      {...props}
    />
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border bg-bg-subtle px-1 font-mono text-[11px] text-text-muted">
      {children}
    </kbd>
  );
}
