/**
 * What a demo has to be before it counts as one of ours.
 *
 * This file is the actual quality mechanism. The upload pipeline moves files
 * around; it cannot make a mediocre build good. What makes an outside
 * developer's work look like ours is starting them from a written standard
 * instead of a blank page, so each brief says what the build must contain and
 * what "finished" means — not vibes, checkable items.
 *
 * `mustHave` is rendered as a checklist the developer ticks before submitting.
 * It is deliberately not enforced server-side: the point is to make the bar
 * legible, not to play whack-a-mole with someone determined to lie. The
 * PageSpeed gate is the part that is enforced, because it is the one promise
 * the public site makes out loud.
 */

export type DemoBrief = {
  key: string;
  label: string;
  /** One line: who this demo is aimed at. */
  audience: string;
  /** The argument the demo has to make in the first five seconds. */
  angle: string;
  /** Checkable inclusions. Rendered as the pre-submission checklist. */
  mustHave: string[];
  /** Things that read as generic. Named because they recur. */
  avoid: string[];
  /** A live build to measure against, when we have one. */
  reference?: { label: string; href: string };
};

/** The floor every demo has to clear, whatever the business type. */
export const UNIVERSAL_REQUIREMENTS = [
  "Mobile-first — designed at 375px before it is designed at 1440px",
  "Real copy, not lorem ipsum, and not obviously AI-written filler",
  "Every placeholder person is unmistakably fake — Jane Doe, 555-01xx numbers",
  "No stock photo of a business claiming to be the business",
  "Working contact path — form, call button, or booking, wired to something",
  "Passes PageSpeed 90+ on mobile, because we guarantee that in public",
] as const;

/** The score a submission has to hit before it reaches the owner's queue. */
export const PAGESPEED_FLOOR = 90;

export const DEMO_BRIEFS: DemoBrief[] = [
  {
    key: "cleaning",
    label: "Cleaning company",
    audience: "Residential and small-commercial cleaners, 1–15 staff, booked by phone today.",
    angle: "The phone rings while they are inside somebody's house. Every missed call is a lost job.",
    mustHave: [
      "Instant quote or booking flow above the fold",
      "Service list split residential vs commercial",
      "Before/after or process section — cleaning is bought on trust",
      "Service-area coverage stated in words, not just a map",
      "Missed-call capture: callback request or text-back",
    ],
    avoid: [
      "A generic 'Our Services' grid of three identical cards",
      "Pricing tables — cleaning is quoted per job, and a fixed table reads as a lie",
    ],
    reference: { label: "CleaningBook", href: "/cleaningbook" },
  },
  {
    key: "trades",
    label: "Trades & home services",
    audience: "Plumbers, electricians, HVAC, roofers. Emergency-driven, mostly local search.",
    angle: "Something is broken right now. The site has to prove they will pick up and turn up.",
    mustHave: [
      "Emergency call-to-action visible without scrolling on mobile",
      "Licence and insurance stated plainly",
      "Service radius and response-time expectation",
      "Reviews near the top, not buried at the bottom",
      "Financing or payment options if the job size warrants it",
    ],
    avoid: [
      "Hero video that delays the phone number",
      "A contact form as the only way to reach them — this audience calls",
    ],
  },
  {
    key: "professional",
    label: "Professional services",
    audience: "Accountants, lawyers, consultants, agencies. Considered purchase, longer cycle.",
    angle: "Credibility before capability. They are being compared to three other firms in a tab.",
    mustHave: [
      "Named people with real roles — anonymity kills this category",
      "Specific outcomes or case detail, not adjectives",
      "Clear engagement model: how you start, what it costs to find out",
      "Consultation booking with a real calendar",
    ],
    avoid: [
      "Stock photography of handshakes and glass buildings",
      "'We deliver bespoke solutions' — says nothing and everyone says it",
    ],
  },
  {
    key: "restaurant",
    label: "Restaurant & hospitality",
    audience: "Independent restaurants, cafés, bars. Discovery is mobile and immediate.",
    angle: "Someone is hungry, nearby, and deciding in under a minute.",
    mustHave: [
      "Hours and location visible without a tap",
      "Menu as real text, never as a PDF or a photo of a menu",
      "Reservation or order path in one tap",
      "Photography of the actual food, or clearly-labelled illustration",
    ],
    avoid: [
      "Autoplaying music",
      "A PDF menu — it is the single most common failure in this category",
    ],
  },
  {
    key: "fitness",
    label: "Fitness & wellness",
    audience: "Gyms, studios, trainers, clinics. Subscription or package economics.",
    angle: "The decision is emotional and the objection is commitment. Lower the first step.",
    mustHave: [
      "A free or low-commitment first action — trial class, intro session",
      "Schedule or class timetable that is actually current",
      "Transparent membership pricing",
      "Transformation or testimonial evidence with names",
    ],
    avoid: [
      "Hiding prices behind an enquiry form",
      "Stock imagery of models who obviously do not train there",
    ],
  },
];

export function getBrief(key: string) {
  return DEMO_BRIEFS.find((b) => b.key === key) ?? null;
}

export function briefLabel(key: string) {
  return getBrief(key)?.label ?? key;
}
