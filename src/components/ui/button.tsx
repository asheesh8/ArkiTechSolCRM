import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Controls sit at a 44px touch target on phones and tablets and drop back to
// the 40px desktop rhythm at lg, where the pointer takes over.
const buttonVariants = cva(
  "inline-flex h-11 touch-manipulation select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold shadow-sm transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 lg:h-10 lg:active:scale-100",
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
        sm: "h-9 px-3 text-xs lg:h-8",
        default: "h-11 px-4 lg:h-10",
        icon: "h-11 w-11 px-0 lg:h-10 lg:w-10",
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
