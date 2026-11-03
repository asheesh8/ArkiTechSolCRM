import { cn } from "@/lib/utils";

/**
 * ArkiTech's ruled-bracket monogram, drawn to the same geometry as the
 * marketing site's mark: a square bracket broken top and bottom, the A's
 * diagonal and the T's stem dropping through the gap. currentColor, so it
 * follows the theme.
 */
export function Mark({ size = 20, className, draw }: { size?: number; className?: string; draw?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="square"
      className={cn("shrink-0", draw && "[&_path]:[stroke-dasharray:120] [&_path]:animate-[draw_900ms_var(--ease-out)_both]", className)}
      aria-hidden
    >
      <path d="M4 10V4h6M22 4h6v6M4 22v6h6M22 28h6v-6" />
      <path d="M9 24 16 8l7 16M11.5 18h9" />
      {draw ? <style>{`@keyframes draw{from{stroke-dashoffset:120}to{stroke-dashoffset:0}}`}</style> : null}
    </svg>
  );
}

export function Lockup({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-text", className)}>
      <Mark size={20} />
      <span className="font-serif text-md leading-none tracking-tight">ArkiTech</span>
      {!compact ? <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.4em] text-text-muted">Solutions</span> : null}
    </span>
  );
}
