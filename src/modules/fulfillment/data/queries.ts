import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { mergeCatalog, parseRequestType, type RequestTypeDefinition } from '../domain/request-types'
import { CLOSED_STATUSES, OPEN_STATUSES } from '../domain/status'
import { listRequestsInput, type ListRequestsInput } from '../domain/schemas'
import { REQUEST_FILES_BUCKET } from '../domain/storage'
import { assertCanView, getViewer } from './context'
import type {
  AttachmentRow,
  CommentRow,
  DeliverableRow,
  EventRow,
  ProfileLite,
  RequestDetail,
  RequestRow,
  RequestSummary,
  RequestTypeRow,
} from './types'

/**
 * Read side. All reads go through the cookie-bound client so RLS applies;
 * the `assertCanView` calls are a second fence, not the first.
 */

const SUMMARY_SELECT = `
  *,
  type:request_types!inner(key, name, icon),
  workspace:workspaces!inner(id, slug, name),
  assignee:profiles!requests_assigned_to_fkey(id, full_name, avatar_url),
  requester:profiles!requests_requested_by_fkey(id, full_name, avatar_url),
  deliverables:request_deliverables(status)
`

type RawSummary = RequestRow & {
  type: { key: string; name: string; icon: string }
  workspace: { id: string; slug: string; name: string }
  assignee: ProfileLite | null
  requester: ProfileLite | null
  deliverables: Array<{ status: string }>
}

function toSummary(r: RawSummary): RequestSummary {
  const { deliverables, ...rest } = r
  return {
    ...rest,
    pending_deliverables: deliverables.filter((d) => d.status === 'pending').length,
    unread_for_viewer: false, // wired by the core's read-receipt table when it lands
  }
}

/** Request types visible to a workspace: globals plus that workspace's overrides. */
export async function getRequestCatalog(workspaceId: string): Promise<RequestTypeDefinition[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('request_types')
    .select('*')
    .or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`)
    .order('sort_order')
  if (error) throw error
  return mergeCatalog((data as RequestTypeRow[]).map(parseRequestType))
}

export async function getWorkspaceBySlug(slug: string): Promise<{ id: string; slug: string; name: string } | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('workspaces').select('id, slug, name').eq('slug', slug).maybeSingle()
  return (data as { id: string; slug: string; name: string } | null) ?? null
}

export interface RequestPage {
  items: RequestSummary[]
  nextCursor: string | null
}

/**
 * Cursor pagination on (updated_at desc, id). Clients get their workspace;
 * staff can pass no workspaceId for the cross-tenant board.
 */
export async function listRequests(raw: ListRequestsInput): Promise<RequestPage> {
  const input = listRequestsInput.parse(raw)
  const viewer = await getViewer()
  if (input.workspaceId) assertCanView(viewer, input.workspaceId)
  else if (!viewer.isStaff) throw new Error('workspaceId is required')

  const supabase = await createClient()
  let q = supabase.from('requests').select(SUMMARY_SELECT).order('updated_at', { ascending: false }).order('id').limit(input.limit + 1)

  if (input.workspaceId) q = q.eq('workspace_id', input.workspaceId)
  if (input.statuses?.length) q = q.in('status', input.statuses)
  else if (input.status === 'open') q = q.in('status', [...OPEN_STATUSES])
  else if (input.status === 'closed') q = q.in('status', [...CLOSED_STATUSES])
  if (input.assigneeId) q = q.eq('assigned_to', input.assigneeId)
  if (input.q) q = q.ilike('title', `%${input.q.replace(/[%_]/g, '')}%`)
  if (input.cursor) {
    const [updatedAt, id] = input.cursor.split('|')
    q = q.or(`updated_at.lt.${updatedAt},and(updated_at.eq.${updatedAt},id.gt.${id})`)
  }

  const { data, error } = await q
  if (error) throw error
  const rows = (data as unknown as RawSummary[]).map(toSummary)
  const hasMore = rows.length > input.limit
  const items = hasMore ? rows.slice(0, input.limit) : rows
  const last = items[items.length - 1]
  return { items, nextCursor: hasMore && last ? `${last.updated_at}|${last.id}` : null }
}

/** Counts for the client home widget and the team board header. */
export async function getRequestCounts(workspaceId?: string): Promise<Record<string, number>> {
  const viewer = await getViewer()
  if (workspaceId) assertCanView(viewer, workspaceId)
  const supabase = await createClient()
  let q = supabase.from('requests').select('status').in('status', [...OPEN_STATUSES])
  if (workspaceId) q = q.eq('workspace_id', workspaceId)
  const { data, error } = await q
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const r of data as Array<{ status: string }>) counts[r.status] = (counts[r.status] ?? 0) + 1
  return counts
}

export async function getRequest(requestId: string): Promise<RequestDetail | null> {
  const viewer = await getViewer()
  const supabase = await createClient()

  const { data: head, error } = await supabase.from('requests').select(SUMMARY_SELECT).eq('id', requestId).maybeSingle()
  if (error) throw error
  if (!head) return null
  const summary = toSummary(head as unknown as RawSummary)
  assertCanView(viewer, summary.workspace_id)

  const [typeRes, commentsRes, attachmentsRes, deliverablesRes, eventsRes] = await Promise.all([
    supabase.from('request_types').select('*').eq('id', summary.type_id).single(),
    supabase
      .from('request_comments')
      .select('*, author:profiles(id, full_name, avatar_url)')
      .eq('request_id', requestId)
      .order('created_at'),
    supabase.from('request_attachments').select('*').eq('request_id', requestId).order('created_at'),
    supabase
      .from('request_deliverables')
      .select('*, posted_by_profile:profiles!request_deliverables_posted_by_fkey(id, full_name, avatar_url)')
      .eq('request_id', requestId)
      .order('created_at'),
    supabase
      .from('request_events')
      .select('*, actor:profiles(id, full_name, avatar_url)')
      .eq('request_id', requestId)
      .order('id'),
  ])
  for (const r of [typeRes, commentsRes, attachmentsRes, deliverablesRes, eventsRes]) if (r.error) throw r.error

  const attachments = attachmentsRes.data as AttachmentRow[]
  const byDeliverable = new Map<string, AttachmentRow[]>()
  for (const a of attachments) {
    if (a.deliverable_id) byDeliverable.set(a.deliverable_id, [...(byDeliverable.get(a.deliverable_id) ?? []), a])
  }

  return {
    ...summary,
    typeDefinition: parseRequestType(typeRes.data as RequestTypeRow),
    comments: (commentsRes.data as Array<CommentRow & { author: ProfileLite | null }>).map((c) => ({ ...c, attachments: [] })),
    attachments: attachments.filter((a) => !a.deliverable_id),
    deliverables: (deliverablesRes.data as Array<DeliverableRow & { posted_by_profile: ProfileLite | null }>).map((d) => ({
      ...d,
      attachments: byDeliverable.get(d.id) ?? [],
    })),
    events: eventsRes.data as Array<EventRow & { actor: ProfileLite | null }>,
  }
}

/** Short-lived download URL. RLS on storage.objects is the real gate. */
export async function getAttachmentUrl(storagePath: string, expiresInSeconds = 60 * 10): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(REQUEST_FILES_BUCKET).createSignedUrl(storagePath, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

/** Team members who can be assigned work. */
export async function listStaff(): Promise<ProfileLite[]> {
  const viewer = await getViewer()
  if (!viewer.isStaff) return []
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('is_staff', true).order('full_name')
  return (data ?? []) as ProfileLite[]
}
