import { z } from 'zod'
import { PRIORITIES, REQUEST_STATUSES } from './status'

/** Input schemas for server actions. Everything the client sends is parsed. */

const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid id')

export const createRequestInput = z.object({
  workspaceId: uuid,
  typeId: uuid,
  title: z.string().trim().min(1, 'Give it a short title').max(160),
  description: z.string().trim().max(10_000).default(''),
  /** Answers to the type's custom fields, validated again against the type. */
  fields: z.record(z.string(), z.unknown()).default({}),
  priority: z.enum(PRIORITIES).default('normal'),
  /** Generated client-side once per form; retries reuse it. */
  idempotencyKey: z.string().min(8).max(80),
  /** Attachment ids uploaded before submit (staged under the draft). */
  attachmentIds: z.array(uuid).max(25).default([]),
  asDraft: z.boolean().default(false),
})
export type CreateRequestInput = z.infer<typeof createRequestInput>

export const updateRequestInput = z.object({
  requestId: uuid,
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(10_000).optional(),
  fields: z.record(z.string(), z.unknown()).optional(),
  priority: z.enum(PRIORITIES).optional(),
})
export type UpdateRequestInput = z.infer<typeof updateRequestInput>

export const transitionRequestInput = z.object({
  requestId: uuid,
  to: z.enum(REQUEST_STATUSES),
  /** Optional note posted as a comment alongside the change. */
  note: z.string().trim().max(10_000).optional(),
})
export type TransitionRequestInput = z.infer<typeof transitionRequestInput>

export const assignRequestInput = z.object({
  requestId: uuid,
  assigneeId: uuid.nullable(),
  dueAt: z.string().datetime({ offset: true }).nullable().optional(),
})

export const addCommentInput = z.object({
  requestId: uuid,
  body: z.string().trim().min(1, 'Write something first').max(10_000),
  internal: z.boolean().default(false),
  attachmentIds: z.array(uuid).max(10).default([]),
})
export type AddCommentInput = z.infer<typeof addCommentInput>

export const postDeliverableInput = z.object({
  requestId: uuid,
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().max(10_000).default(''),
  url: z.string().trim().url().max(2048).optional().or(z.literal('')),
  attachmentIds: z.array(uuid).max(25).default([]),
})
export type PostDeliverableInput = z.infer<typeof postDeliverableInput>

export const decideDeliverableInput = z.object({
  deliverableId: uuid,
  decision: z.enum(['approved', 'changes_requested']),
  note: z.string().trim().max(10_000).optional(),
}).superRefine((v, ctx) => {
  if (v.decision === 'changes_requested' && !(v.note && v.note.length > 0)) {
    ctx.addIssue({ code: 'custom', path: ['note'], message: 'Tell us what to change' })
  }
})
export type DecideDeliverableInput = z.infer<typeof decideDeliverableInput>

export const requestUploadInput = z.object({
  workspaceId: uuid,
  /** Null while composing a new request; files are staged under a draft id. */
  requestId: uuid,
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().nonnegative(),
})
export type RequestUploadInput = z.infer<typeof requestUploadInput>

export const confirmUploadInput = z.object({
  attachmentId: uuid,
  requestId: uuid,
  storagePath: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().nonnegative(),
  deliverableId: uuid.optional(),
})

export const listRequestsInput = z.object({
  workspaceId: uuid.optional(),
  status: z.enum(['open', 'closed', 'all']).default('open'),
  statuses: z.array(z.enum(REQUEST_STATUSES)).optional(),
  assigneeId: uuid.optional(),
  q: z.string().trim().max(120).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
})
export type ListRequestsInput = z.infer<typeof listRequestsInput>

/** Standard action result so the UI never has to try/catch. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export function fromZodError(err: z.ZodError): ActionResult<never> {
  const flat = err.flatten()
  return {
    ok: false,
    error: flat.formErrors[0] ?? 'Check the highlighted fields',
    fieldErrors: flat.fieldErrors as Record<string, string[]>,
  }
}
