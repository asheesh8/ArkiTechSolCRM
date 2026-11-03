import Link from 'next/link'
import { BOARD_COLUMNS, STATUS_META, dueState } from '../domain/status'
import type { RequestSummary } from '../data/types'
import { PriorityTag } from './status-badge'
import { initials, timeAgo } from './format'

/** Team board: one column per working status, horizontally scrollable on small screens. */
export function PipelineBoard({ items, basePath }: { items: RequestSummary[]; basePath: string }) {
  return (
    <div className="flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:px-0">
      {BOARD_COLUMNS.map((status) => {
        const col = items.filter((r) => r.status === status)
        return (
          <section key={status} aria-label={STATUS_META[status].label} className="w-72 shrink-0 snap-start">
            <header className="flex items-center justify-between border-b border-border px-1 py-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-text-muted">{STATUS_META[status].label}</h3>
              <span className="font-mono text-xs text-text-faint">{col.length}</span>
            </header>
            <ul className="mt-2 flex flex-col gap-2">
              {col.map((r) => {
                const due = dueState(r.due_at, r.status)
                return (
                  <li key={r.id}>
                    <Link href={`${basePath}/${r.id}`} className="block rounded-md border border-border bg-bg p-3 hover:border-border-strong">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-text">{r.title}</p>
                        <PriorityTag priority={r.priority} />
                      </div>
                      <p className="mt-1 text-xs text-text-muted">{r.workspace.name} · {r.type.name}</p>
                      <div className="mt-3 flex items-center justify-between font-mono text-xs text-text-faint">
                        <span>REQ-{r.number}</span>
                        <span className="flex items-center gap-2">
                          {due === 'overdue' && <span className="text-[color:var(--danger,#b3372b)]">Overdue</span>}
                          {due === 'soon' && <span className="text-[color:var(--warning,#8a5a12)]">Soon</span>}
                          <span>{timeAgo(r.updated_at)}</span>
                          <span aria-label={r.assignee?.full_name ?? 'Unassigned'} className="grid size-5 place-items-center rounded-full border border-border text-[10px]">
                            {initials(r.assignee?.full_name)}
                          </span>
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
              {col.length === 0 && <li className="px-1 py-3 text-xs text-text-faint">Nothing here</li>}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
