'use client'

import { useCallback, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { confirmUpload, requestUpload, removeAttachment } from '../data/actions'
import { REQUEST_FILES_BUCKET, checkFile, formatBytes } from '../domain/storage'

export interface UploadedFile {
  id: string
  name: string
  size: number
  mime: string
}

interface Item extends UploadedFile {
  state: 'uploading' | 'done' | 'error'
  error?: string
}

interface Props {
  workspaceId: string
  /** Resolves the request id, creating a draft on first use if needed. */
  ensureRequestId: () => Promise<string | null>
  deliverableId?: string
  onChange?: (files: UploadedFile[]) => void
  label?: string
}

/**
 * Direct-to-Storage uploader: server mints a signed URL, the browser PUTs the
 * bytes, then the server records the row. Works with camera roll on phones
 * (plain file input), drag and drop on desktop.
 */
export function FileDropzone({ workspaceId, ensureRequestId, deliverableId, onChange, label = 'Add files' }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const commit = useCallback(
    (next: Item[]) => {
      setItems(next)
      onChange?.(next.filter((i) => i.state === 'done').map(({ id, name, size, mime }) => ({ id, name, size, mime })))
    },
    [onChange],
  )

  async function uploadOne(file: File, requestId: string): Promise<Item> {
    const mime = file.type || 'application/octet-stream'
    const base = { id: crypto.randomUUID(), name: file.name, size: file.size, mime }
    const ticket = await requestUpload({ workspaceId, requestId, fileName: file.name, mimeType: mime, sizeBytes: file.size })
    if (!ticket.ok) return { ...base, state: 'error', error: ticket.error }
    const supabase = createClient()
    const { error } = await supabase.storage
      .from(REQUEST_FILES_BUCKET)
      .uploadToSignedUrl(ticket.data.path, ticket.data.token, file, { contentType: mime })
    if (error) return { ...base, id: ticket.data.attachmentId, state: 'error', error: 'Upload failed. Try again.' }
    const saved = await confirmUpload({
      attachmentId: ticket.data.attachmentId,
      requestId,
      storagePath: ticket.data.path,
      fileName: file.name,
      mimeType: mime,
      sizeBytes: file.size,
      deliverableId,
    })
    if (!saved.ok) return { ...base, id: ticket.data.attachmentId, state: 'error', error: saved.error }
    return { ...base, id: ticket.data.attachmentId, state: 'done' }
  }

  async function addFiles(list: FileList | File[]) {
    const files = Array.from(list)
    const rejected: Item[] = []
    const ok: File[] = []
    for (const f of files) {
      const c = checkFile(f)
      if (c.ok) ok.push(f)
      else rejected.push({ id: crypto.randomUUID(), name: f.name, size: f.size, mime: f.type, state: 'error', error: c.reason })
    }
    if (ok.length === 0) return commit([...items, ...rejected])
    const requestId = await ensureRequestId()
    if (!requestId) return commit([...items, ...rejected, ...ok.map((f) => ({ id: crypto.randomUUID(), name: f.name, size: f.size, mime: f.type, state: 'error' as const, error: 'Could not start the request' }))])

    const pending: Item[] = ok.map((f) => ({ id: crypto.randomUUID(), name: f.name, size: f.size, mime: f.type, state: 'uploading' }))
    let current = [...items, ...rejected, ...pending]
    commit(current)
    await Promise.all(
      ok.map(async (f, i) => {
        const done = await uploadOne(f, requestId)
        current = current.map((it) => (it.id === pending[i]!.id ? done : it))
        commit(current)
      }),
    )
  }

  async function remove(item: Item) {
    if (item.state === 'done') await removeAttachment(item.id)
    commit(items.filter((i) => i.id !== item.id))
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void addFiles(e.dataTransfer.files) }}
        className={`rounded-md border border-dashed p-4 text-center text-sm ${drag ? 'border-accent bg-accent-subtle' : 'border-border-strong'}`}
      >
        <button type="button" onClick={() => input.current?.click()} className="font-medium text-accent-text underline-offset-2 hover:underline">
          {label}
        </button>
        <span className="text-text-muted"> or drop them here. Up to 100 MB each.</span>
        <input ref={input} type="file" multiple className="sr-only" onChange={(e) => e.target.files && void addFiles(e.target.files)} />
      </div>
      {items.length > 0 && (
        <ul className="mt-2 divide-y divide-border rounded-md border border-border text-sm" aria-live="polite">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 px-3 py-2">
              <span className="min-w-0 flex-1 truncate">{it.name}</span>
              <span className="font-mono text-xs text-text-muted">{formatBytes(it.size)}</span>
              <span className={`text-xs ${it.state === 'error' ? 'text-[color:var(--danger,#b3372b)]' : 'text-text-muted'}`}>
                {it.state === 'uploading' ? 'Uploading…' : it.state === 'done' ? 'Added' : it.error}
              </span>
              <button type="button" onClick={() => void remove(it)} className="text-xs text-text-muted hover:text-text" aria-label={`Remove ${it.name}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
