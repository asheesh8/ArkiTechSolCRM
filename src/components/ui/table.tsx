import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Hairline tables: 40px rows, no zebra, mono figures right-aligned.
 * On phones, pages switch to card lists (see components/ui/list.tsx)
 * instead of squeezing a table.
 */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}
export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-bg-subtle text-left text-xs text-text-muted", className)} {...props} />;
}
export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}
export function TR({ className, interactive, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return <tr className={cn("border-t border-border first:border-t-0", interactive && "cursor-pointer hover:bg-surface-hover", className)} {...props} />;
}
export function TH({ className, numeric, ...props }: React.ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return <th className={cn("h-9 px-3 font-medium", numeric && "text-right", className)} {...props} />;
}
export function TD({ className, numeric, ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return <td className={cn("h-10 px-3 align-middle", numeric && "tnum text-right font-mono text-xs", className)} {...props} />;
}
