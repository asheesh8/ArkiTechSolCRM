"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/** Compact underline tabs driven by a URL search param or by hrefs. */
export function Tabs({
  items,
  param = "tab",
  className,
}: {
  items: { key: string; label: string; count?: number; href?: string }[];
  param?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get(param) ?? items[0]?.key;
  return (
    <div className={cn("-mb-px flex gap-1 overflow-x-auto border-b border-border", className)} role="tablist">
      {items.map((it) => {
        const active = it.href ? pathname === it.href : current === it.key;
        const href = it.href ?? `${pathname}?${new URLSearchParams({ ...Object.fromEntries(sp.entries()), [param]: it.key }).toString()}`;
        return (
          <Link
            key={it.key}
            href={href}
            role="tab"
            aria-selected={active}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 border-b-2 px-2.5 text-sm transition-colors",
              active ? "border-text font-medium text-text" : "border-transparent text-text-muted hover:text-text",
            )}
          >
            {it.label}
            {typeof it.count === "number" ? <span className="tnum font-mono text-[11px] text-text-faint">{it.count}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

/** Segmented control for a few mutually exclusive views. */
export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; className?: string }) {
  return (
    <div className={cn("inline-flex h-8 items-center rounded-md border border-border bg-bg-subtle p-0.5", className)} role="group">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-sm transition-colors",
            value === o.value ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
