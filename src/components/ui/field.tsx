import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] dark:placeholder:text-zinc-500",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] dark:placeholder:text-zinc-500",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]",
        props.className,
      )}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-semibold text-zinc-700 dark:text-zinc-200", className)} {...props} />;
}
