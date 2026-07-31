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
    <section className={cn("flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1.5 text-xs font-semibold text-[var(--muted)] sm:mb-2">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold tracking-normal text-zinc-950 dark:text-zinc-50 sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      {/* Actions share the row evenly on small screens instead of overflowing;
          at lg they revert to their natural widths beside the title. */}
      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-2 [&>*]:min-w-0 [&>*]:flex-1 lg:w-auto lg:shrink-0 lg:[&>*]:flex-none">
          {actions}
        </div>
      ) : null}
    </section>
  );
}
