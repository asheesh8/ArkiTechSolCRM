import { formatCss, oklch, parse, clampChroma, wcagContrast, type Oklch } from "culori";

/**
 * Builds a 12-step accent ladder from one brand colour, in OKLCH so a navy
 * stays navy when it's lightened. Step 9 is the brand colour itself; the rest
 * borrow the neutral lightness ladder and a fraction of the brand's chroma.
 *
 * Guardrails: near-white, near-black or grey brand colours keep their hue but
 * get a safe lightness for step 9 so buttons stay visible. `adjusted` tells
 * the theme screen to say so.
 */
const LIGHT_L = [0.992, 0.978, 0.958, 0.938, 0.915, 0.89, 0.845, 0.765, null, null, 0.47, 0.3];
const DARK_L = [0.16, 0.185, 0.215, 0.24, 0.265, 0.29, 0.335, 0.405, null, null, 0.8, 0.93];
const CHROMA = [0.04, 0.08, 0.16, 0.24, 0.34, 0.46, 0.6, 0.78, 1, 1, 0.9, 0.55];

export type AccentScale = { light: string[]; dark: string[]; onAccent: string; adjusted: boolean };

export function accentScale(hex: string | undefined): AccentScale {
  const base = oklch(parse(hex ?? "") ?? parse("#eaa14d")!) as Oklch;
  let { l, c } = base;
  const h = base.h ?? 70;
  let adjusted = false;
  if (l > 0.88 || l < 0.2 || c < 0.03) {
    adjusted = true;
    l = 0.55;
    c = Math.max(c, 0.09);
  }
  const brand: Oklch = { mode: "oklch", l, c, h };

  const ladder = (Ls: (number | null)[], dark: boolean) =>
    Ls.map((L, i) => {
      if (i === 8) return formatCss(clampChroma(brand, "oklch"));
      if (i === 9) return formatCss(clampChroma({ ...brand, l: dark ? Math.min(0.95, l + 0.06) : Math.max(0.1, l - 0.05) }, "oklch"));
      return formatCss(clampChroma({ mode: "oklch", l: L!, c: c * CHROMA[i], h }, "oklch"));
    });

  const white = parse("#ffffff")!;
  const ink = parse("oklch(0.22 0.006 85)")!;
  const onAccent = wcagContrast(brand, white) >= wcagContrast(brand, ink) ? "#ffffff" : "oklch(0.22 0.006 85)";

  return { light: ladder(LIGHT_L, false), dark: ladder(DARK_L, true), onAccent, adjusted };
}

/** The <style> body that re-themes a workspace. Server-rendered, so no flash. */
export function themeCss(hex: string | undefined, radius: "sharp" | "soft" | "round" = "soft") {
  const s = accentScale(hex);
  const vars = (list: string[]) => list.map((v, i) => `--accent-${i + 1}:${v}`).join(";");
  const r = radius === "sharp" ? "2px;--radius-md:4px;--radius-lg:6px" : radius === "round" ? "6px;--radius-md:10px;--radius-lg:14px" : "4px;--radius-md:6px;--radius-lg:10px";
  return `:root{${vars(s.light)};--on-accent:${s.onAccent};--radius-sm:${r}}[data-theme="dark"]{${vars(s.dark)};--on-accent:${s.onAccent}}`;
}
