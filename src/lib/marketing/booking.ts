import { services } from "@/lib/services-content";

/**
 * The questions the get-started form asks before the calendar. The dialog
 * renders these and /api/contact accepts only these, so a changed option is
 * one edit here.
 */
export const BOOKING_SERVICES = ["Growth Partnership", ...services.map((s) => s.name), "Not sure yet"];

export const BOOKING_CURRENT_SITE = [
  { value: "No website yet", hint: null },
  { value: "Yes, but it needs work", hint: "Slow, dated, or not bringing in leads" },
  { value: "Yes, and it works well", hint: "We want to add to it" },
] as const;

export const BOOKING_TIMELINES = [
  { value: "As soon as possible", hint: "It's costing us now" },
  { value: "Within a month", hint: "We have a date in mind" },
  { value: "In 1-3 months", hint: "Planning ahead" },
  { value: "Just exploring", hint: "Getting a sense of options and cost" },
] as const;

export const BOOKING_BUDGETS = [
  { value: "Under $1,000", hint: null },
  { value: "$1,000 to $3,000", hint: null },
  { value: "$3,000 or more", hint: null },
  { value: "A monthly plan", hint: "Starting at $300 a month" },
  { value: "Not sure yet", hint: "Help us figure it out" },
] as const;

/**
 * The sentence a visitor ticks before the form sends. The form shows it and
 * the API stores it on the lead with the time and IP, so it has to be the one
 * copy of the wording: if anyone asks what someone agreed to, this is it.
 */
export const CONTACT_CONSENT_TEXT =
  "I agree that ArkiTech Solutions can contact me by phone, text message and email about this request. Message frequency varies, message and data rates may apply, and I can reply STOP at any time.";

/**
 * Where people pick a time once they've answered: the Google Calendar
 * appointment schedule on studio@. NEXT_PUBLIC_BOOKING_URL overrides it.
 * This is the page calendar.app.google/xPTeVayL6CR5RNXR6 redirects to; the
 * short link itself can't be framed.
 */
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL?.trim() ||
  "https://calendar.google.com/appointments/schedules/AcZssZ2yl-bbbD07s8Kbn522_sWFr-n5I9-OCS-z79A7pwQdfwHUHaSsvgva_RGnkvMS2oKe5JiaaMrF";

/** Google's booking pages need ?gv=true to render inside an iframe. */
export function bookingEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "calendar.google.com" && u.pathname.includes("/appointments/")) u.searchParams.set("gv", "true");
    return u.toString();
  } catch {
    return url;
  }
}
