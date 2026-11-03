import { PRIORITY_META, STATUS_META, type RequestPriority, type RequestStatus } from '../domain/status'

const TONE: Record<string, string> = {
  neutral: 'bg-bg-subtle text-text-muted border-border',
  accent: 'bg-accent-subtle text-accent-text border-accent-border',
  info: 'bg-bg-subtle text-text border-border',
  success: 'bg-[color:var(--success-subtle,#e7f3ec)] text-[color:var(--success,#1f7a4d)] border-border',
  warning: 'bg-[color:var(--warning-subtle,#fbf1dc)] text-[color:var(--warning,#8a5a12)] border-border',
  danger: 'bg-[color:var(--danger-subtle,#fbe6e3)] text-[color:var(--danger,#b3372b)] border-border',
}

/** Status is always label + dot, never colour alone. */
export function StatusBadge({ status, audience = 'client' }: { status: RequestStatus; audience?: 'client' | 'team' }) {
  const meta = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium ${TONE[meta.tone]}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {audience === 'client' ? meta.clientLabel : meta.label}
    </span>
  )
}

export function PriorityTag({ priority }: { priority: RequestPriority }) {
  if (priority === 'normal') return null
  const meta = PRIORITY_META[priority]
  return <span className={`rounded-sm border px-1.5 py-0.5 text-xs ${TONE[meta.tone]}`}>{meta.label}</span>
}
