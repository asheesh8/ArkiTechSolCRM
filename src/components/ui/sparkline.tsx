import { cn } from "@/lib/utils";

/** A tiny trend line for stat tiles. Pure SVG, no library. */
export function Sparkline({ values, className, tone = "neutral", width = 96, height = 28 }: { values: number[]; className?: string; tone?: "neutral" | "success" | "danger" | "accent"; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => [i * step, height - 2 - ((v - min) / span) * (height - 4)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;
  const color = tone === "success" ? "var(--success)" : tone === "danger" ? "var(--danger)" : tone === "accent" ? "var(--accent-9)" : "var(--neutral-9)";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("shrink-0 overflow-visible", className)} aria-hidden>
      <path d={area} fill={color} opacity={0.08} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1]![0]} cy={pts[pts.length - 1]![1]} r={2} fill={color} />
    </svg>
  );
}
