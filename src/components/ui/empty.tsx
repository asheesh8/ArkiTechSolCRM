import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** One honest line and one action. Never a paragraph. */
export function Empty({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center", className)}>
      {Icon ? (
        <div className="flex size-10 items-center justify-center rounded-md border border-border bg-bg-subtle text-text-faint">
          <Icon className="size-5" strokeWidth={1.5} />
        </div>
      ) : null}
      <div>
        <p className="text-sm font-medium text-text">{title}</p>
        {body ? <p className="mt-1 max-w-sm text-sm text-text-muted">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}
