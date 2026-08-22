/**
 * Flags drawn behind the team initials.
 *
 * Inline SVG rather than image files: they render at any size without a
 * request, and the palette stays in the stylesheet's hands. Both are drawn to
 * their real proportions — Nepal is the one national flag that isn't a
 * rectangle, so it gets its actual double-pennant silhouette rather than being
 * squashed into a box.
 *
 * These sit behind large type at low opacity, so the emblems are simplified to
 * what still reads at that size: the shape, the colours, and the symbols in
 * roughly the right place.
 */

type RayProps = {
  count: number;
  cx: number;
  cy: number;
  inner: number;
  outer: number;
  from?: number;
  to?: number;
  /** Fraction of each ray's slice that the triangle base fills. */
  spread?: number;
};

/** Triangular rays fanned around a centre — used for both suns and the moon. */
function Rays({ count, cx, cy, inner, outer, from = 0, to = 360, spread = 0.4 }: RayProps) {
  const step = (to - from) / count;
  const at = (r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  };

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const mid = from + step * (i + 0.5);
        const w = step * spread;
        return <path key={i} d={`M${at(outer, mid)} L${at(inner, mid - w)} L${at(inner, mid + w)} Z`} />;
      })}
    </>
  );
}

type FlagArt = { className?: string; style?: React.CSSProperties };

const CRIMSON = "#DC143C";

function NepalFlag({ className, style }: FlagArt) {
  return (
    // Padded viewBox so the blue border's mitred points aren't clipped.
    <svg viewBox="-28 -28 782 941" className={className} style={style} aria-hidden="true" focusable="false">
      <path
        d="M0 0 L726 478 L360 478 L726 885 L0 885 Z"
        fill={CRIMSON}
        stroke="#003893"
        strokeWidth="44"
        strokeLinejoin="miter"
        strokeMiterlimit="8"
      />

      {/* Moon — a disc bitten by a second disc in the field colour, then rays
          laid over the top so they survive the bite. */}
      <circle cx="250" cy="300" r="76" fill="#fff" />
      <circle cx="250" cy="256" r="76" fill={CRIMSON} />
      <g fill="#fff">
        <Rays count={8} cx={250} cy={306} inner={70} outer={120} from={180} to={360} />
      </g>

      {/* Sun */}
      <g fill="#fff">
        <Rays count={12} cx={250} cy={650} inner={58} outer={112} />
        <circle cx="250" cy="650" r="58" />
      </g>
    </svg>
  );
}

function KiribatiFlag({ className, style }: FlagArt) {
  return (
    <svg viewBox="0 0 1200 600" className={className} style={style} aria-hidden="true" focusable="false">
      <rect width="1200" height="600" fill="#CE1126" />

      {/* Rising sun. Drawn whole and centred on the horizon — the sea painted
          over it next is what crops it to a rising half. */}
      <g fill="#FCD116">
        <Rays count={17} cx={600} cy={300} inner={104} outer={208} from={180} to={360} spread={0.36} />
        <circle cx="600" cy="300" r="104" />
      </g>

      <rect y="300" width="1200" height="300" fill="#003F87" />

      {/* Three wavy bands, each one stroked path rather than a filled shape. */}
      <g fill="none" stroke="#fff" strokeWidth="34">
        {[356, 446, 536].map((y) => (
          <path key={y} d={`M0 ${y} q75 -26 150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0`} />
        ))}
      </g>

      {/* Frigatebird, soaring above the sun with its head to the hoist.

          Drawn solid and deliberately heavy — an anatomically thinner bird
          disappeared into the sun's rays behind it, which is the one thing
          that would stop the flag being readable at watermark size. */}
      <g fill="#FCD116">
        <path
          d="M252 96
             C372 118 486 156 566 200
             L600 186
             C692 140 806 108 948 92
             C874 158 764 208 664 238
             L688 316 L620 282 L552 316 L578 240
             C468 210 344 162 252 96 Z"
        />
        {/* head and hooked beak */}
        <path d="M600 186 C566 172 528 168 494 178 C520 188 534 196 546 208 C566 200 584 194 600 186 Z" />
      </g>
    </svg>
  );
}

// Sized in `em` so each flag tracks the initials it sits behind — the type is
// fluid, and a fixed rem size drifted badly between phone and desktop. The two
// values differ because the flags do: Nepal is portrait, Kiribati is 1:2.
const FLAGS = {
  nepal: { Flag: NepalFlag, label: "Nepal", style: { height: "1.5em" } },
  kiribati: { Flag: KiribatiFlag, label: "Kiribati", style: { width: "1.8em" } },
} as const;

export type Country = keyof typeof FLAGS;

/**
 * A flag sized to sit behind a pair of initials.
 *
 * Decorative, so the SVG itself is `aria-hidden` — the country is announced
 * once by the visually hidden label instead of being spelled out of the
 * drawing.
 */
export function TeamFlag({ country }: { country: Country }) {
  const { Flag, label, style } = FLAGS[country];

  return (
    // Anchored to the left of the initials rather than centred on them: the
    // initials sit hard against the page padding, so a centred flag hung off
    // the edge of the page.
    <span
      className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2"
      style={{ opacity: 0.34 }}
    >
      {/* max-w-none so the flag can overhang the initials rather than being
          shrunk to fit them. */}
      <Flag className="block max-w-none" style={style} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
