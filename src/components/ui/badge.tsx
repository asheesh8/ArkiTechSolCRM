import { cn, formatStatus } from "@/lib/utils";

const tones: Record<string, string> = {
  NEW: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900",
  SAVED: "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800",
  CALLED: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900",
  MEETING_BOOKED: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
  NOT_INTERESTED: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900",
  FOLLOW_UP: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  CLOSED: "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:ring-teal-900",
  STANDARD: "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800",
  PRIORITY: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-900",
  FAVORITE: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1", tones[value] ?? tones.SAVED, className)}>
      {formatStatus(value)}
    </span>
  );
}
