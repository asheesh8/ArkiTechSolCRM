import Link from 'next/link'
import { dueState, STATUS_META } from '../domain/status'
import type { RequestSummary } from '../data/types'
import { StatusBadge, PriorityTag } from './status-badge'
import { timeAgo } from './format'

interface Props {
  items: RequestSummary[]
  /** Base path for detail links, e.g. `/acme/requests` or `/team/fulfillment`. */
  basePath: string
  audience: 'client' | 'team'
}

/**
 * Table on desktop, stacked cards on phones, same data. Rows waiting on the
 * client carry the accent marker so "what do I owe them" is scannable.
 */
export function RequestList({ items, basePath, audience }: Props) {
  if (items.length === 0) return <EmptyState audience={audience} />
  return (
    <>
      <ul className="divide-y divide-border border-y border-border md:hidden" aria-label="Requests">
        {items.map((r) => (
          <li key={r.id}>
            <Link href={`${basePath}/${r.id}`} className="flex flex-col gap-1.5 px-4 py-3 active:bg-surface-hover">
              <div className="flex items-start justify-between gap-3">
                <span className="text-base font-medium text-text">{r.title}</span>
                <StatusBadge status={r.status} audience={audience} />
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
                <span>REQ-{r.number}</span>
                <span aria-hidden>·</span>
                <span>{r.type.name}</span>
                {audience === 'team' && <><span aria-hidden>·</span><span>{r.workspace.name}</span></>}
                <span className="ml-auto">{timeAgo(r.updated_at)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-text-muted">
            <th className="w-24 py-2 pl-4 font-normal">Ref</th>
            <th className="font-normal">Request</th>
            {audience === 'team' && <th className="font-normal">Client</th>}
            <th className="font-normal">Type</th>
            <th className="font-normal">Status</th>
            {audience === 'team' && <th className="font-normal">Owner</th>}
            <th className="pr-4 text-right font-normal">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => {
            const waiting = STATUS_META[r.status].owner === 'client' && audience === 'client'
            const due = dueState(r.due_at, r.status)
            return (
              <tr key={r.id} className="h-10 border-b border-border hover:bg-surface-hover">
                <td className={`py-0 pl-4 font-mono text-xs text-text-muted ${waiting ? 'border-l-2 border-l-accent' : ''}`}>REQ-{r.number}</td>
                <td>
                  <Link href={`${basePath}/${r.id}`} className="font-medium text-text hover:underline">{r.title}</Link>{' '}
                  <PriorityTag priority={r.priority} />
                </td>
                {audience === 'team' && <td className="text-text-muted">{r.workspace.name}</td>}
                <td className="text-text-muted">{r.type.name}</td>
                <td><StatusBadge status={r.status} audience={audience} /></td>
                {audience === 'team' && (
                  <td className="text-text-muted">
                    {r.assignee?.full_name ?? '—'}
                    {due === 'overdue' && <span className="ml-2 text-[color:var(--danger,#b3372b)]">Overdue</span>}
                    {due === 'soon' && <span className="ml-2 text-[color:var(--warning,#8a5a12)]">Due soon</span>}
                  </td>
                )}
                <td className="pr-4 text-right text-text-muted">{timeAgo(r.updated_at)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

function EmptyState({ audience }: { audience: 'client' | 'team' }) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="font-serif text-xl text-text">{audience === 'client' ? 'Nothing open right now' : 'Inbox clear'}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted">
        {audience === 'client'
          ? 'When you need a change, a new page, or a fix, send it here and we will pick it up.'
          : 'No requests match this view.'}
      </p>
    </div>
  )
}
