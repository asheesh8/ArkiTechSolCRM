import { services } from "@/lib/services-content";

/**
 * The three questions "Book a free call" asks before the calendar. The dialog
 * renders these and /api/contact accepts only these, so a changed option is
 * one edit here.
 */
export const BOOKING_SERVICES = [...services.map((s) => s.name), "Not sure yet"];

export const BOOKING_TIMELINES = [
  { value: "As soon as possible", hint: "It's costing us now" },
  { value: "Within a month", hint: "We have a date in mind" },
  { value: "In 1-3 months", hint: "Planning ahead" },
  { value: "Just exploring", hint: "Getting a sense of options and cost" },
] as const;

export const BOOKING_BUDGETS = [
  { value: "Under $1,000", hint: null },
  { value: "$1,000 to $2,500", hint: null },
  { value: "$2,500 to $5,000", hint: null },
  { value: "$5,000 or more", hint: null },
  { value: "Not sure yet", hint: "Help us figure it out" },
] as const;

/**
 * Where people pick a time once they've answered. A Google Calendar
 * appointment schedule on studio@ is the intended target; Cal.com or Calendly
 * links embed the same way. Empty means the dialog ends at "we'll be in touch".
 */
export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || "";

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
