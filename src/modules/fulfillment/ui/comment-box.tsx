'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addComment } from '../data/actions'

export function CommentBox({ requestId, canNoteInternally }: { requestId: string; canNoteInternally: boolean }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [internal, setInternal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function send() {
    setError(null)
    start(async () => {
      const r = await addComment({ requestId, body, internal })
      if (!r.ok) return setError(r.error)
      setBody('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex flex-col gap-2">
      <label className="sr-only" htmlFor="comment">Message</label>
      <textarea id="comment" rows={3} value={body} onChange={(e) => setBody(e.target.value)}
        placeholder={internal ? 'Internal note, the client will not see this' : 'Write a message'}
        className={`w-full rounded-md border px-3 py-2 text-base md:text-sm ${internal ? 'border-accent bg-accent-subtle' : 'border-border-strong bg-bg'}`} />
      <div className="flex items-center justify-between gap-3">
        {canNoteInternally ? (
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note
          </label>
        ) : <span />}
        <button type="submit" disabled={pending || body.trim() === ''} className="h-9 rounded-md bg-accent px-4 text-sm font-medium text-on-accent disabled:opacity-50">
          {pending ? 'Sending…' : 'Send'}
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-[color:var(--danger,#b3372b)]">{error}</p>}
    </form>
  )
}
