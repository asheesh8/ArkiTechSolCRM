import * as React from "react";
import { cn } from "@/lib/utils";

/** Page title row: serif title, one line of context, actions on the right. */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">{eyebrow}</div> : null}
        <h1 className="font-serif text-2xl text-text">{title}</h1>
        {description ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Section({ title, children, actions, className }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {title ? (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
