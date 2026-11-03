import { z } from 'zod'

/**
 * Request type catalog and the small form DSL stored in request_types.fields.
 * The seed migration owns the default catalog; workspaces may add or override
 * types. This file validates the field definitions and the answers.
 */

export const FIELD_KINDS = ['text', 'textarea', 'url', 'select', 'date', 'files', 'toggle'] as const
export type FieldKind = (typeof FIELD_KINDS)[number]

export const fieldDefinitionSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_]{0,39}$/, 'field keys are snake_case'),
  label: z.string().min(1).max(120),
  type: z.enum(FIELD_KINDS),
  required: z.boolean().optional(),
  help: z.string().max(240).optional(),
  options: z.array(z.string().min(1).max(80)).max(20).optional(),
  placeholder: z.string().max(120).optional(),
})
export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>

export const fieldListSchema = z
  .array(fieldDefinitionSchema)
  .max(20)
  .superRefine((fields, ctx) => {
    const seen = new Set<string>()
    fields.forEach((f, i) => {
      if (seen.has(f.key)) ctx.addIssue({ code: 'custom', message: `duplicate field key "${f.key}"`, path: [i, 'key'] })
      seen.add(f.key)
      if (f.type === 'select' && (!f.options || f.options.length === 0)) {
        ctx.addIssue({ code: 'custom', message: 'select fields need options', path: [i, 'options'] })
      }
    })
  })

export interface RequestTypeDefinition {
  id: string
  workspaceId: string | null
  key: string
  name: string
  description: string
  icon: string
  fields: FieldDefinition[]
  slaHours: number
  requiresApproval: boolean
  includedInPlan: boolean
  sortOrder: number
  isActive: boolean
}

/** Parse a raw `request_types` row into a typed definition. Throws on bad JSON. */
export function parseRequestType(row: {
  id: string
  workspace_id: string | null
  key: string
  name: string
  description: string
  icon: string
  fields: unknown
  sla_hours: number
  requires_approval: boolean
  included_in_plan: boolean
  sort_order: number
  is_active: boolean
}): RequestTypeDefinition {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    key: row.key,
    name: row.name,
    description: row.description,
    icon: row.icon,
    fields: fieldListSchema.parse(row.fields ?? []),
    slaHours: row.sla_hours,
    requiresApproval: row.requires_approval,
    includedInPlan: row.included_in_plan,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }
}

/**
 * A workspace override wins over a global type with the same key. Result is
 * sorted for the type picker.
 */
export function mergeCatalog(types: RequestTypeDefinition[]): RequestTypeDefinition[] {
  const byKey = new Map<string, RequestTypeDefinition>()
  for (const t of types) {
    if (!t.isActive) continue
    const existing = byKey.get(t.key)
    if (!existing || (existing.workspaceId === null && t.workspaceId !== null)) byKey.set(t.key, t)
  }
  return [...byKey.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

/**
 * Build a zod schema for the answers to a type's fields. `files` fields are
 * not part of the answers: uploads are rows in request_attachments.
 */
export function answersSchema(fields: FieldDefinition[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of fields) {
    if (f.type === 'files') continue
    let s: z.ZodTypeAny
    switch (f.type) {
      case 'text':
        s = z.string().trim().max(500)
        break
      case 'textarea':
        s = z.string().trim().max(10_000)
        break
      case 'url':
        s = z
          .string()
          .trim()
          .max(2048)
          .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v) || /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v), {
            message: 'Enter a link like https://example.com/page',
          })
        break
      case 'select':
        s = z.string().refine((v) => v === '' || (f.options ?? []).includes(v), { message: 'Pick one of the options' })
        break
      case 'date':
        s = z.string().refine((v) => v === '' || !Number.isNaN(Date.parse(v)), { message: 'Enter a date' })
        break
      case 'toggle':
        s = z.boolean()
        break
    }
    if (f.required && f.type !== 'toggle') {
      s = (s as z.ZodString).refine((v: string) => v.trim().length > 0, { message: `${f.label} is required` })
    }
    shape[f.key] = f.required ? s : s.optional()
  }
  return z.object(shape).strict()
}

/** Keys of `files` fields on a type (used to decide whether to show the dropzone). */
export function fileFieldKeys(fields: FieldDefinition[]): string[] {
  return fields.filter((f) => f.type === 'files').map((f) => f.key)
}
