import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  },
  z.string().url().nullable().optional(),
);

export const leadStatuses = [
  "NEW",
  "SAVED",
  "CALLED",
  "MEETING_BOOKED",
  "NOT_INTERESTED",
  "FOLLOW_UP",
  "CLOSED",
] as const;

export const leadPriorities = ["STANDARD", "PRIORITY", "FAVORITE"] as const;

export const callOutcomes = [
  "NO_ANSWER",
  "LEFT_VOICEMAIL",
  "CALLED",
  "NOT_INTERESTED",
  "FOLLOW_UP",
  "MEETING_BOOKED",
  "CLOSED",
] as const;

export const noteTypes = ["GENERAL", "FOLLOW_UP", "MEETING"] as const;

export const leadExclusionReasons = ["ARCHIVED", "DECLINED"] as const;

export const leadSearchSchema = z.object({
  location: z.string().min(1, "Enter a town, state, or ZIP before searching"),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  category: z.string().optional(),
  maxReviewCount: z.coerce.number().int().nonnegative().optional(),
  minimumRating: z.coerce.number().min(0).max(5).optional(),
  onlyNoWebsite: z.coerce.boolean().optional(),
  onlyWeakWebsite: z.coerce.boolean().optional(),
});

export const leadCreateSchema = z.object({
  businessName: z.string().min(1),
  category: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  website: optionalUrl,
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  googlePlaceId: z.string().optional().nullable(),
  googleMapsUrl: optionalUrl,
  googleRating: z.coerce.number().optional().nullable(),
  googleReviewCount: z.coerce.number().int().optional().nullable(),
  status: z.enum(leadStatuses).default("SAVED"),
  priority: z.enum(leadPriorities).default("STANDARD"),
  websiteScore: z.coerce.number().int().optional().nullable(),
  pageSpeedPerformance: z.coerce.number().int().optional().nullable(),
  pageSpeedAccessibility: z.coerce.number().int().optional().nullable(),
  pageSpeedSEO: z.coerce.number().int().optional().nullable(),
  pageSpeedBestPractices: z.coerce.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
});

export const leadUpdateSchema = leadCreateSchema.partial().extend({
  status: z.enum(leadStatuses).optional(),
});

export const noteCreateSchema = z.object({
  note: z.string().min(1, "Add a note before saving"),
  noteType: z.enum(noteTypes).default("GENERAL"),
  callOutcome: z.enum(callOutcomes),
  followUpDate: z.string().datetime().optional().nullable().or(z.literal("")),
  // Present when the note came from a call dialled inside the CRM. Capped at
  // four hours so a softphone tab left open overnight can't log a nonsense
  // number against a lead.
  durationSecs: z.number().int().min(0).max(4 * 60 * 60).optional().nullable(),
  providerCallSid: z.string().trim().max(64).optional().nullable(),
});

export const pageSpeedSchema = z.object({
  url: z.string().url("Enter a full URL including https://"),
  leadId: z.string().optional().nullable(),
  strategy: z.enum(["mobile", "desktop"]).default("mobile"),
  save: z.boolean().optional(),
});

export const leadExclusionSchema = z.object({
  googlePlaceId: z.string().min(1),
  businessName: z.string().min(1),
  reason: z.enum(leadExclusionReasons),
});

// The two values printed on the Twilio console home page. Everything else
// browser dialling needs is created from these rather than asked for.
export const twilioCredentialsSchema = z.object({
  accountSid: z
    .string()
    .trim()
    .regex(/^AC[0-9a-fA-F]{32}$/, "An Account SID starts with AC followed by 32 characters"),
  authToken: z.string().trim().min(32, "That Auth Token looks too short").max(128),
});

export const twilioConnectSchema = twilioCredentialsSchema.extend({
  callerId: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, "Pick one of the numbers on your Twilio account"),
});

// A row of the public pricing table. Money arrives in cents from the editor,
// which does the dollar conversion, so nothing here has to parse currency.
export const pricingPlanSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  group: z.enum(["websites", "receptionist", "systems", "growth"]),
  name: z.string().trim().min(1, "Give the plan a name").max(80),
  blurb: z.string().trim().min(1, "One sentence on who this is for").max(400),
  monthlyCents: z.number().int().min(0).max(100_000_00).nullable(),
  onceCents: z.number().int().min(0).max(1_000_000_00).nullable(),
  priceNote: z.string().trim().max(40).nullable(),
  features: z.array(z.string().trim().min(1).max(160)).max(20),
  featured: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export const pricingPlansSchema = z.object({
  plans: z.array(pricingPlanSchema).max(40),
});
