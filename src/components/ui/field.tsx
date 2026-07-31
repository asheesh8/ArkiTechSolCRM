import * as React from "react";
import { cn } from "@/lib/utils";

// Fields render at 16px below lg so iOS Safari doesn't zoom the page when one
// is focused, and at a 44px height so they're comfortable to tap.
const fieldBase =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] text-base outline-none transition placeholder:text-zinc-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] dark:placeholder:text-zinc-500 lg:text-sm";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(fieldBase, "h-11 px-3 lg:h-10", props.className)}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(fieldBase, "min-h-24 px-3 py-2", props.className)}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(fieldBase, "h-11 px-3 lg:h-10", props.className)}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-semibold text-zinc-700 dark:text-zinc-200", className)} {...props} />;
}
