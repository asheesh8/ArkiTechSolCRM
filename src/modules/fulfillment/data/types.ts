import type { RequestPriority, RequestStatus } from '../domain/status'

/**
 * Row shapes for the module's tables. When the core runs `supabase gen types`
 * these are superseded by the generated `Database` type; until then they
 * keep the data layer honest. Field names match the SQL exactly.
 */

export type ActorKind = 'client' | 'team' | 'system'
export type DeliverableStatus = 'pending' | 'approved' | 'changes_requested'

export interface RequestTypeRow {
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
  created_at: string
  updated_at: string
}

export interface RequestRow {
  id: string
  workspace_id: string
  number: number
  type_id: string
  title: string
  description: string
  fields: Record<string, unknown>
  status: RequestStatus
  priority: RequestPriority
  requested_by: string | null
  assigned_to: string | null
  due_at: string | null
  submitted_at: string | null
  started_at: string | null
  delivered_at: string | null
  completed_at: string | null
  idempotency_key: string | null
  created_at: string
  updated_at: string
}

export interface CommentRow {
  id: string
  workspace_id: string
  request_id: string
  author_id: string | null
  author_kind: ActorKind
  body: string
  internal: boolean
  created_at: string
}

export interface AttachmentRow {
  id: string
  workspace_id: string
  request_id: string
  deliverable_id: string | null
  uploaded_by: string | null
  uploaded_by_kind: ActorKind
  storage_path: string
  file_name: string
  mime_type: string
  size_bytes: number
  created_at: string
}

export interface DeliverableRow {
  id: string
  workspace_id: string
  request_id: string
  title: string
  summary: string
  url: string | null
  status: DeliverableStatus
  version: number
  posted_by: string | null
  decided_by: string | null
  decided_at: string | null
  decision_note: string | null
  created_at: string
  updated_at: string
}

export interface EventRow {
  id: number
  workspace_id: string
  request_id: string
  actor_id: string | null
  actor_kind: ActorKind
  kind: string
  data: Record<string, unknown>
  created_at: string
}

export interface ProfileLite {
  id: string
  full_name: string | null
  avatar_url: string | null
}

/** What the list and board render. One query, no N+1. */
export interface RequestSummary extends RequestRow {
  type: { key: string; name: string; icon: string }
  workspace: { id: string; slug: string; name: string }
  assignee: ProfileLite | null
  requester: ProfileLite | null
  pending_deliverables: number
  unread_for_viewer: boolean
}

/** Everything the detail view needs. */
export interface RequestDetail extends RequestSummary {
  comments: Array<CommentRow & { author: ProfileLite | null; attachments: AttachmentRow[] }>
  attachments: AttachmentRow[]
  deliverables: Array<DeliverableRow & { attachments: AttachmentRow[]; posted_by_profile: ProfileLite | null }>
  events: Array<EventRow & { actor: ProfileLite | null }>
  typeDefinition: import('../domain/request-types').RequestTypeDefinition
}
