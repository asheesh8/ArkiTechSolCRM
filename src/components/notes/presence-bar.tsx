"use client";

import { cn } from "@/lib/utils";
import { initials, userColor, type Presence } from "@/components/notes/presence-utils";

// Google-Docs-style collaborator bar: overlapping colored avatars for whoever
// else is currently on this page, with a live pulse.
export function PresenceBar({ others }: { others: Presence[] }) {
  if (others.length === 0) return null;
  const shown = others.slice(0, 4);
  const extra = others.length - shown.length;

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2" title="Live">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <div className="flex -space-x-1.5">
        {shown.map((p) => (
          <span
            key={p.userId}
            title={p.name}
            className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white dark:ring-zinc-950", userColor(p.userId))}
          >
            {initials(p.name)}
          </span>
        ))}
        {extra > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-300 text-[10px] font-semibold text-zinc-700 ring-2 ring-white dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-950">
            +{extra}
          </span>
        )}
      </div>
      <span className="hidden text-xs text-zinc-500 sm:inline">
        {others.length === 1 ? `${others[0].name} is here` : `${others.length} people here`}
      </span>
    </div>
  );
}
