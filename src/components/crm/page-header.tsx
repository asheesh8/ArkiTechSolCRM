import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-xs font-semibold text-[var(--muted)]">{eyebrow}</p> : null}
        <h2 className="text-2xl font-semibold tracking-normal text-zinc-950 dark:text-zinc-50">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </section>
  );
}
