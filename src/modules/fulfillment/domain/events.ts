import type { RequestStatus } from './status'

/**
 * Notification hooks.
 *
 * The database writes an outbox row for every event that someone should hear
 * about (see requests_after_change and friends). The core notifications
 * worker drains `notification_outbox`, looks up the template here, renders it
 * and sends it on the channels the recipient allows. This file is the single
 * place that knows how a fulfillment event reads as a message.
 *
 * The worker calls `renderNotification(template, payload, ctx)` and gets back
 * a title, body and deep link. Unknown templates return null so a template
 * added in SQL before TS never crashes the worker.
 */

export type Audience = 'client_admins' | 'client_all' | 'team' | 'user'
export type ChannelHint = 'inapp' | 'email' | 'sms' | 'push'

export interface OutboxRow {
  id: number
  workspace_id: string
  recipient_id: string | null
  audience: Audience
  channel_hint: ChannelHint
  template: string
  payload: Record<string, unknown>
  dedupe_key: string
  created_at: string
  sent_at: string | null
}

export interface RenderContext {
  workspaceName: string
  /** Absolute base URL of the portal, no trailing slash. */
  portalUrl: string
  /** Workspace slug for client links. */
  workspaceSlug: string
}

export interface RenderedNotification {
  title: string
  body: string
  url: string
  /** Short SMS-safe version, under 160 chars. */
  sms: string
}

type Payload = Record<string, unknown>
const str = (p: Payload, k: string, fallback = '') => (typeof p[k] === 'string' ? (p[k] as string) : fallback)
const num = (p: Payload, k: string) => (typeof p[k] === 'number' ? (p[k] as number) : undefined)

function clientLink(ctx: RenderContext, requestId: string) {
  return `${ctx.portalUrl}/${ctx.workspaceSlug}/requests/${requestId}`
}
function teamLink(ctx: RenderContext, requestId: string) {
  return `${ctx.portalUrl}/admin/fulfillment/${requestId}`
}

const STATUS_COPY: Partial<Record<RequestStatus, { title: string; body: string }>> = {
  in_progress: { title: 'We started on it', body: 'Your request is in progress.' },
  awaiting_client: { title: 'We need something from you', body: 'There is a question or a file we need before we can keep going.' },
  delivered: { title: 'Ready for your approval', body: 'Take a look and approve it, or tell us what to change.' },
  completed: { title: 'Done', body: 'This request is complete. Thanks for the approval.' },
  on_hold: { title: 'Paused', body: 'This request is on hold for now. We will say why in the thread.' },
  cancelled: { title: 'Cancelled', body: 'This request was cancelled.' },
}

export function renderNotification(template: string, payload: Payload, ctx: RenderContext): RenderedNotification | null {
  const requestId = str(payload, 'request_id')
  const number = num(payload, 'number')
  const ref = number ? `REQ-${number}` : 'your request'
  const title = str(payload, 'title')

  if (template === 'request.submitted') {
    const t = `${ctx.workspaceName}: new request ${ref}`
    return { title: t, body: title, url: teamLink(ctx, requestId), sms: `${t}: ${title}`.slice(0, 160) }
  }
  if (template.startsWith('request.status.')) {
    const status = template.slice('request.status.'.length) as RequestStatus
    const copy = STATUS_COPY[status]
    if (!copy) return null
    const t = `${copy.title}: ${title || ref}`
    return { title: t, body: copy.body, url: clientLink(ctx, requestId), sms: `${ctx.workspaceName}. ${t}. ${clientLink(ctx, requestId)}`.slice(0, 160) }
  }
  if (template === 'request.comment') {
    const t = `New message on ${ref}`
    return { title: t, body: 'Open the request to read and reply.', url: clientLink(ctx, requestId), sms: `${t}. ${clientLink(ctx, requestId)}`.slice(0, 160) }
  }
  if (template === 'deliverable.approved') {
    const t = `${ctx.workspaceName} approved ${ref}`
    return { title: t, body: str(payload, 'note') || 'No note.', url: teamLink(ctx, requestId), sms: t }
  }
  if (template === 'deliverable.changes_requested') {
    const t = `${ctx.workspaceName} asked for changes on ${ref}`
    return { title: t, body: str(payload, 'note') || 'No note.', url: teamLink(ctx, requestId), sms: t }
  }
  return null
}

/**
 * Resolve an outbox audience to recipient user ids. The core passes in the
 * workspace membership; this keeps the module free of a direct dependency on
 * the core's tables.
 */
export function resolveAudience(
  row: Pick<OutboxRow, 'audience' | 'recipient_id'>,
  members: Array<{ userId: string; role: 'owner' | 'admin' | 'member' }>,
  staffIds: string[],
): string[] {
  switch (row.audience) {
    case 'user':
      return row.recipient_id ? [row.recipient_id] : []
    case 'team':
      return staffIds
    case 'client_admins':
      return members.filter((m) => m.role === 'owner' || m.role === 'admin').map((m) => m.userId)
    case 'client_all':
      return members.map((m) => m.userId)
  }
}

/** Activity-log copy for the timeline in the request detail view. */
export function describeEvent(kind: string, data: Payload, actorName: string): string {
  switch (kind) {
    case 'submitted':
      return `${actorName} submitted this request`
    case 'status_changed': {
      const to = str(data, 'to') as RequestStatus
      const copy: Record<RequestStatus, string> = {
        draft: 'moved it back to draft',
        submitted: 'submitted it',
        in_review: 'started reviewing',
        in_progress: 'started work',
        awaiting_client: 'asked for something',
        delivered: 'delivered it',
        completed: 'marked it done',
        on_hold: 'paused it',
        cancelled: 'cancelled it',
      }
      return `${actorName} ${copy[to] ?? `set status to ${to}`}`
    }
    case 'assigned':
      return data.assigned_to ? `${actorName} assigned it` : `${actorName} unassigned it`
    case 'comment_added':
      return data.internal ? `${actorName} left an internal note` : `${actorName} commented`
    case 'deliverable_posted':
      return `${actorName} posted "${str(data, 'title')}"`
    case 'deliverable_approved':
      return `${actorName} approved the deliverable`
    case 'deliverable_changes_requested':
      return `${actorName} asked for changes`
    case 'file_added':
      return `${actorName} added ${str(data, 'file_name', 'a file')}`
    default:
      return `${actorName}: ${kind.replace(/_/g, ' ')}`
  }
}
