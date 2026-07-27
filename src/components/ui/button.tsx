import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[linear-gradient(135deg,var(--accent),var(--brand-emerald))] text-[var(--accent-foreground)] hover:brightness-105",
        secondary: "border border-[var(--border)] bg-[var(--surface-strong)] text-zinc-900 hover:bg-white dark:text-zinc-50 dark:hover:bg-zinc-900",
        outline: "border border-[var(--border)] bg-[var(--surface)] text-zinc-800 hover:bg-[var(--surface-strong)] dark:text-zinc-100",
        ghost: "shadow-none hover:bg-zinc-900/5 dark:hover:bg-white/10",
        danger: "border border-red-700 bg-red-600 text-white shadow-sm hover:bg-red-700 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-500",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
