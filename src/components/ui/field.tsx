import * as React from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-md border border-input bg-surface px-3 text-base text-text placeholder:text-text-faint transition-colors focus:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(control, "h-9 md:h-8 md:text-sm", className)} {...props} />;
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(control, "min-h-24 py-2 leading-relaxed md:text-sm", className)} {...props} />;
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn(control, "h-9 appearance-none bg-no-repeat pr-8 md:h-8 md:text-sm", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23888' stroke-width='1.5'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 8px center" }} {...props}>
      {children}
    </select>
  );
});

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-sm font-medium text-text">
        {label}
        {optional ? <span className="text-xs font-normal text-text-faint">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-text", className)} {...props} />;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  name,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-150 disabled:opacity-50",
        checked ? "border-accent bg-accent" : "border-border-strong bg-control",
      )}
    >
      {name ? <input type="hidden" name={name} value={checked ? "on" : "off"} /> : null}
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150",
          checked ? "translate-x-[18px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn("size-4 shrink-0 cursor-pointer rounded-sm border border-input bg-surface accent-[var(--accent-9)]", className)}
      {...props}
    />
  );
}
