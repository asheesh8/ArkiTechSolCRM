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
