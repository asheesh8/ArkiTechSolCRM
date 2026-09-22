import clsx from "clsx";
import { PLATES, type PlateKey } from "@/lib/marketing/art";

/**
 * A public-domain engraving, inked with the theme's --art token. Decorative
 * by default; pass `label` when the plate is doing illustrative work.
 */
export function Plate({
  name,
  className,
  style,
  label,
  fill = false,
}: {
  name: PlateKey;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  /** Fill the parent box instead of sizing to the plate's own proportions. */
  fill?: boolean;
}) {
  const plate = PLATES[name];
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={clsx("plate", className)}
      style={{
        aspectRatio: fill ? undefined : `${plate.w} / ${plate.h}`,
        WebkitMaskImage: `url(${plate.src})`,
        maskImage: `url(${plate.src})`,
        ...style,
      }}
    />
  );
}
