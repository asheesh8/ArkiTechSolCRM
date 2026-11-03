/**
 * Request status pipeline.
 *
 * Mirrors the transition table enforced by the `requests_before_update`
 * trigger in supabase/migrations/20261103010100_fulfillment_schema.sql.
 * The database decides *what* moves exist; this file decides *who* may make
 * them and how they read in the UI. Keep the two in sync.
 */

export const REQUEST_STATUSES = [
  'draft',
  'submitted',
  'in_review',
  'in_progress',
  'awaiting_client',
  'delivered',
  'completed',
  'on_hold',
  'cancelled',
] as const

export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export type Actor = 'client' | 'team' | 'system'

/** Allowed next statuses, by current status. Must match the SQL trigger. */
export const TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['in_review', 'in_progress', 'awaiting_client', 'on_hold', 'cancelled'],
  in_review: ['in_progress', 'awaiting_client', 'on_hold', 'cancelled'],
  in_progress: ['awaiting_client', 'delivered', 'on_hold', 'cancelled'],
  awaiting_client: ['in_review', 'in_progress', 'on_hold', 'cancelled'],
  delivered: ['in_progress', 'completed', 'cancelled'],
  on_hold: ['in_review', 'in_progress', 'cancelled'],
  completed: ['in_progress'],
  cancelled: [],
}

/**
 * Which actor may trigger which transition. Clients only ever submit a draft
 * or cancel something that has not started. Everything else is the team, or
 * the system (deliverable approval moves delivered -> completed).
 */
const CLIENT_ALLOWED: ReadonlyArray<[RequestStatus, RequestStatus]> = [
  ['draft', 'submitted'],
  ['draft', 'cancelled'],
  ['submitted', 'cancelled'],
]

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

export function canActorTransition(actor: Actor, from: RequestStatus, to: RequestStatus): boolean {
  if (!canTransition(from, to)) return false
  if (actor === 'team' || actor === 'system') return true
  return CLIENT_ALLOWED.some(([f, t]) => f === from && t === to)
}

export function nextStatusesFor(actor: Actor, from: RequestStatus): RequestStatus[] {
  return TRANSITIONS[from].filter((to) => canActorTransition(actor, from, to))
}

export const OPEN_STATUSES: readonly RequestStatus[] = [
  'submitted',
  'in_review',
  'in_progress',
  'awaiting_client',
  'delivered',
  'on_hold',
]

export const CLOSED_STATUSES: readonly RequestStatus[] = ['completed', 'cancelled']

export function isOpen(status: RequestStatus): boolean {
  return OPEN_STATUSES.includes(status)
}

/**
 * Presentation. `tone` maps to a semantic token set in the UI:
 *  - neutral: grey
 *  - accent: the brand accent (lamp), reserved for "waiting on you"
 *  - success / warning / danger: fixed status colours
 * `owner` says whose move it is, which is what the client actually wants to
 * know ("is this on me or on them?").
 */
export interface StatusMeta {
  label: string
  clientLabel: string
  tone: 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger'
  owner: 'client' | 'team' | 'nobody'
  /** Order in the team pipeline board, left to right. */
  order: number
}

export const STATUS_META: Record<RequestStatus, StatusMeta> = {
  draft: { label: 'Draft', clientLabel: 'Draft', tone: 'neutral', owner: 'client', order: 0 },
  submitted: { label: 'New', clientLabel: 'Received', tone: 'info', owner: 'team', order: 1 },
  in_review: { label: 'Reviewing', clientLabel: 'Being reviewed', tone: 'info', owner: 'team', order: 2 },
  in_progress: { label: 'In progress', clientLabel: 'In progress', tone: 'info', owner: 'team', order: 3 },
  awaiting_client: { label: 'Waiting on client', clientLabel: 'Waiting on you', tone: 'accent', owner: 'client', order: 4 },
  delivered: { label: 'Delivered', clientLabel: 'Ready for your approval', tone: 'accent', owner: 'client', order: 5 },
  completed: { label: 'Done', clientLabel: 'Done', tone: 'success', owner: 'nobody', order: 6 },
  on_hold: { label: 'On hold', clientLabel: 'Paused', tone: 'warning', owner: 'nobody', order: 7 },
  cancelled: { label: 'Cancelled', clientLabel: 'Cancelled', tone: 'neutral', owner: 'nobody', order: 8 },
}

/** Columns shown on the team board, in order. Closed ones are a filter. */
export const BOARD_COLUMNS: readonly RequestStatus[] = [
  'submitted',
  'in_review',
  'in_progress',
  'awaiting_client',
  'delivered',
  'on_hold',
]

/** The client home needs one number: how many requests are waiting on them. */
export function countWaitingOnClient(statuses: readonly RequestStatus[]): number {
  return statuses.filter((s) => STATUS_META[s].owner === 'client' && s !== 'draft').length
}

export const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
export type RequestPriority = (typeof PRIORITIES)[number]

export const PRIORITY_META: Record<RequestPriority, { label: string; tone: StatusMeta['tone'] }> = {
  low: { label: 'Low', tone: 'neutral' },
  normal: { label: 'Normal', tone: 'neutral' },
  high: { label: 'High', tone: 'warning' },
  urgent: { label: 'Urgent', tone: 'danger' },
}

/** Due-date health for list rows and the board. */
export type DueState = 'none' | 'ok' | 'soon' | 'overdue'

export function dueState(dueAt: string | Date | null, status: RequestStatus, now = new Date()): DueState {
  if (!dueAt || !isOpen(status) || status === 'awaiting_client' || status === 'delivered' || status === 'on_hold') {
    return 'none'
  }
  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt
  const ms = due.getTime() - now.getTime()
  if (ms < 0) return 'overdue'
  if (ms < 24 * 60 * 60 * 1000) return 'soon'
  return 'ok'
}
