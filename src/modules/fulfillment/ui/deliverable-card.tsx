'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { decideDeliverable } from '../data/actions'
import type { AttachmentRow, DeliverableRow } from '../data/types'
import { formatBytes } from '../domain/storage'
import { timeAgo } from './format'

interface Props {
  deliverable: DeliverableRow & { attachments: AttachmentRow[] }
  canDecide: boolean
  /** Signed download URLs by attachment id, resolved on the server. */
  urls: Record<string, string>
}

/** The moment that matters: approve it or say what to change. */
export function DeliverableCard({ deliverable: d, canDecide, urls }: Props) {
  const router = useRouter()
  const [asking, setAsking] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function decide(decision: 'approved' | 'changes_requested') {
    setError(null)
    start(async () => {
      const r = await decideDeliverable({ deliverableId: d.id, decision, note: note || undefined })
      if (!r.ok) return setError(r.fieldErrors?.note?.[0] ?? r.error)
      router.refresh()
    })
  }

  return (
    <article className={`rounded-md border p-4 ${d.status === 'pending' ? 'border-accent-border bg-accent-subtle' : 'border-border bg-bg'}`}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-text">{d.title}</h3>
          <p className="font-mono text-xs text-text-muted">Version {d.version} · {timeAgo(d.created_at)}</p>
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
          {d.status === 'pending' ? 'Needs your decision' : d.status === 'approved' ? 'Approved' : 'Changes requested'}
        </span>
      </header>
      {d.summary && <p className="mt-3 whitespace-pre-wrap text-sm text-text">{d.summary}</p>}
      {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="mt-3 block truncate text-sm text-accent-text underline">{d.url}</a>}
      {d.attachments.length > 0 && (
        <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-bg text-sm">
          {d.attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-3 py-2">
              <a href={urls[a.id]} className="min-w-0 flex-1 truncate hover:underline" download={a.file_name}>{a.file_name}</a>
              <span className="font-mono text-xs text-text-muted">{formatBytes(a.size_bytes)}</span>
            </li>
          ))}
        </ul>
      )}
      {d.decision_note && <p className="mt-3 border-l-2 border-border-strong pl-3 text-sm text-text-muted">{d.decision_note}</p>}

      {d.status === 'pending' && canDecide && (
        <div className="mt-4">
          {asking && (
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should we change?"
              className="mb-3 w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-base md:text-sm" autoFocus />
          )}
          <div className="flex flex-wrap gap-2">
            {!asking ? (
              <>
                <button disabled={pending} onClick={() => decide('approved')} className="h-10 flex-1 rounded-md bg-accent px-4 text-sm font-medium text-on-accent md:h-9 md:flex-none">Approve</button>
                <button disabled={pending} onClick={() => setAsking(true)} className="h-10 flex-1 rounded-md border border-border-strong px-4 text-sm md:h-9 md:flex-none">Request changes</button>
              </>
            ) : (
              <>
                <button disabled={pending} onClick={() => decide('changes_requested')} className="h-10 rounded-md bg-accent px-4 text-sm font-medium text-on-accent md:h-9">Send feedback</button>
                <button disabled={pending} onClick={() => setAsking(false)} className="h-10 rounded-md border border-border-strong px-4 text-sm md:h-9">Back</button>
              </>
            )}
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-[color:var(--danger,#b3372b)]">{error}</p>}
        </div>
      )}
      {d.status === 'pending' && !canDecide && (
        <p className="mt-4 text-sm text-text-muted">Waiting on your account owner or an admin to approve this.</p>
      )}
    </article>
  )
}
