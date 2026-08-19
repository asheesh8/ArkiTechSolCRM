import type { Season } from "@/components/mascot/arki-mascot";

/**
 * One switch for Arki's seasonal dress, so nothing else in the site has to know
 * what month it is.
 *
 * Seasons start ahead of the calendar on purpose — seasonal campaigns run before the
 * season does, and a mascot in a knit hat on the first cold day reads as attentive
 * rather than late.
 *
 * Set OVERRIDE to force one while designing.
 */
const OVERRIDE: Season | null = null;

export function currentSeason(date = new Date()): Season {
  if (OVERRIDE) return OVERRIDE;

  const month = date.getMonth();
  const day = date.getDate();

  if ((month === 7 && day >= 15) || month === 8 || month === 9 || month === 10) return "autumn";
  if (month === 11 || month === 0 || month === 1) return "winter";
  return "none";
}
