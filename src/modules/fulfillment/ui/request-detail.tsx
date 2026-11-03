import type { RequestDetail } from '../data/types'
import { describeEvent } from '../domain/events'
import { canApprove, type Viewer } from '../data/context-shared'
import { formatBytes } from '../domain/storage'
import { CommentBox } from './comment-box'
import { DeliverableCard } from './deliverable-card'
import { PriorityTag, StatusBadge } from './status-badge'
import { initials, timeAgo } from './format'

interface Props {
  request: RequestDetail
  viewer: Viewer
  urls: Record<string, string>
  /** Rendered beside the thread for staff (TeamControls). */
  teamPanel?: React.ReactNode
}

/**
 * Thread-first detail. Order is the order of importance to a client: what we
 * need from you, the deliverables, then the conversation, then the brief.
 */
export function RequestDetailView({ request: r, viewer, urls, teamPanel }: Props) {
  const audience = viewer.isStaff ? 'team' : 'client'
  const decide = canApprove(viewer, r.workspace_id)
  const pendingDeliverables = r.deliverables.filter((d) => d.status === 'pending')

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-w-0 flex-col gap-8">
        <header>
          <p className="font-mono text-xs text-text-muted">REQ-{r.number} · {r.type.name}</p>
          <h1 className="mt-1 font-serif text-3xl leading-tight text-text">{r.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={r.status} audience={audience} />
            <PriorityTag priority={r.priority} />
            {r.due_at && r.status !== 'completed' && <span className="text-xs text-text-muted">Target {new Date(r.due_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>}
          </div>
        </header>

        {r.deliverables.length > 0 && (
          <section aria-label="Deliverables" className="flex flex-col gap-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted">
              {pendingDeliverables.length > 0 ? 'Ready for you' : 'Delivered'}
            </h2>
            {r.deliverables.map((d) => <DeliverableCard key={d.id} deliverable={d} canDecide={decide} urls={urls} />)}
          </section>
        )}

        <section aria-label="Brief" className="flex flex-col gap-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted">Brief</h2>
          {r.description && <p className="whitespace-pre-wrap text-sm text-text">{r.description}</p>}
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {r.typeDefinition.fields.filter((f) => f.type !== 'files' && r.fields[f.key] !== undefined && r.fields[f.key] !== '').map((f) => (
              <div key={f.key}>
                <dt className="text-xs text-text-muted">{f.label}</dt>
                <dd className="mt-0.5 break-words text-text">{String(r.fields[f.key])}</dd>
              </div>
            ))}
          </dl>
          {r.attachments.length > 0 && (
            <ul className="divide-y divide-border rounded-md border border-border text-sm">
              {r.attachments.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-3 py-2">
                  <a href={urls[a.id]} download={a.file_name} className="min-w-0 flex-1 truncate hover:underline">{a.file_name}</a>
                  <span className="font-mono text-xs text-text-muted">{formatBytes(a.size_bytes)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Conversation" className="flex flex-col gap-4">
          <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted">Conversation</h2>
          <ol className="flex flex-col gap-4">
            {r.comments.map((c) => (
              <li key={c.id} className={`flex gap-3 ${c.internal ? 'rounded-md border border-accent-border bg-accent-subtle p-3' : ''}`}>
                <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-xs">{initials(c.author?.full_name)}</span>
                <div className="min-w-0">
                  <p className="text-sm"><span className="font-medium">{c.author?.full_name ?? (c.author_kind === 'team' ? 'Arkitech' : 'Someone')}</span>{' '}
                    <span className="text-text-muted">{c.internal ? 'internal note · ' : ''}{timeAgo(c.created_at)}</span></p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-text">{c.body}</p>
                </div>
              </li>
            ))}
            {r.comments.length === 0 && <li className="text-sm text-text-muted">No messages yet.</li>}
          </ol>
          <CommentBox requestId={r.id} canNoteInternally={viewer.isStaff} />
        </section>

        <section aria-label="Activity">
          <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted">Activity</h2>
          <ol className="mt-3 border-l border-border pl-4 text-sm text-text-muted">
            {r.events.filter((e) => viewer.isStaff || !(e.kind === 'comment_added' && e.data.internal)).map((e) => (
              <li key={e.id} className="py-1">{describeEvent(e.kind, e.data, e.actor?.full_name ?? (e.actor_kind === 'team' ? 'Arkitech' : e.actor_kind === 'system' ? 'System' : 'Client'))} · {timeAgo(e.created_at)}</li>
            ))}
          </ol>
        </section>
      </div>

      {teamPanel && <div className="lg:sticky lg:top-6 lg:self-start">{teamPanel}</div>}
    </div>
  )
}
