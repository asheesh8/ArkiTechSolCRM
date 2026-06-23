import { z } from "zod";

export const leadStatuses = [
  "NEW",
  "SAVED",
  "CALLED",
  "MEETING_BOOKED",
  "NOT_INTERESTED",
  "FOLLOW_UP",
  "CLOSED",
] as const;

export const callOutcomes = [
  "NO_ANSWER",
  "LEFT_VOICEMAIL",
  "NOT_INTERESTED",
  "FOLLOW_UP",
  "MEETING_BOOKED",
  "CLOSED",
] as const;

export const leadExclusionReasons = ["ARCHIVED", "DECLINED"] as const;

export const leadSearchSchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  category: z.string().min(1, "Industry is required"),
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
  website: z.string().url().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  googlePlaceId: z.string().optional().nullable(),
  googleMapsUrl: z.string().url().optional().nullable().or(z.literal("")),
  googleRating: z.coerce.number().optional().nullable(),
  googleReviewCount: z.coerce.number().int().optional().nullable(),
  status: z.enum(leadStatuses).default("SAVED"),
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
  userId: z.string().optional(),
  note: z.string().min(1, "Add a note before saving"),
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
