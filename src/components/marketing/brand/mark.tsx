import clsx from "clsx";

/**
 * The ArkiTech monogram, measured off the supplied artwork
 * (research/brand-originals/arkitech-mark.png, 1254px square) rather than
 * redrawn by eye. Coordinates are that file's own pixels, so the viewBox is
 * the frame's bounding box: a bracket broken once on the top and once on the
 * bottom, an A-stroke with horizontally cut ends, and a T whose stem drops
 * through the bottom gap.
 *
 * Every piece is a filled shape, not a stroke, so the diagonal keeps its flat
 * cut ends. `draw` extends each piece from its origin like a line being ruled.
 */
const PIECES = [
  // frame
  { d: "M307 308h19v635h-19z", o: "50% 0%", axis: "y", t: 0 },
  { d: "M928 308h19v635h-19z", o: "50% 100%", axis: "y", t: 1 },
  { d: "M307 308h405v18H307z", o: "0% 50%", axis: "x", t: 2 },
  { d: "M800 308h147v18H800z", o: "100% 50%", axis: "x", t: 3 },
  { d: "M307 926h221v17H307z", o: "0% 50%", axis: "x", t: 4 },
  { d: "M773 926h174v17H773z", o: "100% 50%", axis: "x", t: 5 },
  // A-stroke
  { d: "M641 403h25L382 831h-26z", o: "100% 0%", axis: "xy", t: 6 },
  // T
  { d: "M547 624h309v17H547z", o: "0% 50%", axis: "x", t: 7 },
  { d: "M675 641h20v302h-20z", o: "50% 0%", axis: "y", t: 8 },
] as const;

export function Mark({
  className,
  draw = false,
  title,
}: {
  className?: string;
  draw?: boolean;
  title?: string;
}) {
  return (
    <svg
      viewBox="307 308 640 636"
      className={clsx("mark", draw && "mark--draw", className)}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {PIECES.map((p) => (
        <path
          key={p.d}
          d={p.d}
          data-axis={p.axis}
          style={{ transformOrigin: p.o, ["--i" as string]: p.t }}
        />
      ))}
    </svg>
  );
}

/**
 * Horizontal lockup: mark, serif name, spaced mono "Solutions", set the way
 * the supplied horizontal artwork sets them. Live text, so it takes the colour
 * of whatever band it sits on.
 */
export function Lockup({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={clsx("lockup", compact && "lockup--compact", className)}>
      <Mark className="lockup__mark" />
      <span className="lockup__words">
        <span className="lockup__name">ArkiTech</span>
        <span className="lockup__sub">Solutions</span>
      </span>
    </span>
  );
}
