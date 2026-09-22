/**
 * Public-domain plates, each the nineteenth-century ancestor of the thing a
 * service builds. Cut to masks by research/scripts/cut-art.py; sources and
 * licences in research/sources/CREDITS.json.
 */
export type PlateKey =
  | "elevation"
  | "difference-engine"
  | "bell-telephone"
  | "bell-circuits"
  | "hollerith"
  | "lighthouse"
  | "chart-burlington"
  | "chart-lake";

export const PLATES: Record<PlateKey, { src: string; w: number; h: number; caption: string }> = {
  elevation: {
    src: "/art/elevation.webp",
    w: 1800,
    h: 1085,
    caption: "Elevation of a salon, Palais Royal. Diderot's Encyclopédie, 1762.",
  },
  "difference-engine": {
    src: "/art/difference-engine.webp",
    w: 930,
    h: 1294,
    caption: "A portion of Babbage's Difference Engine, 1853.",
  },
  "bell-telephone": {
    src: "/art/bell-telephone.webp",
    w: 458,
    h: 204,
    caption: "A. G. Bell, U.S. Patent 174,465, fig. 7. March 7, 1876.",
  },
  "bell-circuits": {
    src: "/art/bell-circuits.webp",
    w: 492,
    h: 332,
    caption: "A. G. Bell, U.S. Patent 174,465, fig. 6. March 7, 1876.",
  },
  hollerith: {
    src: "/art/hollerith.webp",
    w: 622,
    h: 480,
    caption: "Hollerith's electrical counting machines, 1890 census. Scientific American.",
  },
  lighthouse: {
    src: "/art/lighthouse.webp",
    w: 1278,
    h: 2126,
    caption: "Optical apparatus, Bustard Head light, 1865.",
  },
  "chart-burlington": {
    src: "/art/chart-burlington.webp",
    w: 2200,
    h: 2106,
    caption: "Burlington Bay, U.S. Coast Survey chart of Lake Champlain, 1874.",
  },
  "chart-lake": {
    src: "/art/chart-lake.webp",
    w: 1800,
    h: 2449,
    caption: "Lake Champlain, Cumberland Head to Ligonier Point. U.S. Coast Survey, 1874.",
  },
};

/** Which plate stands for which service. */
export const SERVICE_PLATE: Record<string, PlateKey> = {
  websites: "elevation",
  automations: "difference-engine",
  "ai-receptionist": "bell-telephone",
  "crm-portals": "hollerith",
  "brand-seo": "lighthouse",
};
