'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { assignRequest, postDeliverable, transitionRequest } from '../data/actions'
import { STATUS_META, nextStatusesFor, type RequestStatus } from '../domain/status'
import type { ProfileLite } from '../data/types'
import { FileDropzone } from './file-dropzone'

interface Props {
  requestId: string
  workspaceId: string
  status: RequestStatus
  assigneeId: string | null
  staff: ProfileLite[]
}

/** Team-only panel: move the request, assign it, post a deliverable. */
export function TeamControls({ requestId, workspaceId, status, assigneeId, staff }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [files, setFiles] = useState<string[]>([])

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError(null)
      const r = await fn()
      if (!r.ok) setError(r.error ?? 'Failed')
      else router.refresh()
    })

  return (
    <aside className="flex flex-col gap-4 rounded-md border border-border p-4" aria-label="Team controls">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Assignee</span>
        <select value={assigneeId ?? ''} disabled={pending} className="h-9 rounded-md border border-border-strong bg-bg px-2"
          onChange={(e) => run(() => assignRequest({ requestId, assigneeId: e.target.value || null }))}>
          <option value="">Unassigned</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name ?? 'Team member'}</option>)}
        </select>
      </label>

      <div>
        <p className="text-sm font-medium">Move to</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {nextStatusesFor('team', status).filter((s) => s !== 'delivered').map((s) => (
            <button key={s} disabled={pending} onClick={() => run(() => transitionRequest({ requestId, to: s }))}
              className="h-8 rounded-md border border-border-strong px-3 text-sm hover:bg-surface-hover">{STATUS_META[s].label}</button>
          ))}
        </div>
      </div>

      {!posting ? (
        <button onClick={() => setPosting(true)} className="h-9 rounded-md bg-accent text-sm font-medium text-on-accent">Post a deliverable</button>
      ) : (
        <div className="flex flex-col gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-9 rounded-md border border-border-strong bg-bg px-3 text-sm" />
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="What changed" className="rounded-md border border-border-strong bg-bg px-3 py-2 text-sm" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link (optional)" className="h-9 rounded-md border border-border-strong bg-bg px-3 text-sm" />
          <FileDropzone workspaceId={workspaceId} ensureRequestId={async () => requestId} onChange={(f) => setFiles(f.map((x) => x.id))} label="Attach files" />
          <div className="flex gap-2">
            <button disabled={pending || !title.trim()} onClick={() => run(async () => {
              const r = await postDeliverable({ requestId, title, summary, url, attachmentIds: files })
              if (r.ok) { setPosting(false); setTitle(''); setSummary(''); setUrl('') }
              return r.ok ? { ok: true } : { ok: false, error: r.error }
            })} className="h-9 flex-1 rounded-md bg-accent text-sm font-medium text-on-accent disabled:opacity-50">Send for approval</button>
            <button onClick={() => setPosting(false)} className="h-9 rounded-md border border-border-strong px-3 text-sm">Cancel</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-[color:var(--danger,#b3372b)]">{error}</p>}
    </aside>
  )
}
