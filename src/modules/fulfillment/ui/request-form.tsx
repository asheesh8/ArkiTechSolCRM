'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRequest } from '../data/actions'
import type { FieldDefinition, RequestTypeDefinition } from '../domain/request-types'
import { PRIORITIES, PRIORITY_META, type RequestPriority } from '../domain/status'
import { FileDropzone } from './file-dropzone'

interface Props {
  workspaceId: string
  basePath: string
  catalog: RequestTypeDefinition[]
  initialTypeKey?: string
}

/**
 * Two steps: pick a type (cards), then answer its questions. The title is
 * always asked; everything else comes from the type's field list so a new
 * request type needs a row, not code. Files attach to a draft that is created
 * lazily on first upload, so submit is the only moment the team is notified.
 */
export function RequestForm({ workspaceId, basePath, catalog, initialTypeKey }: Props) {
  const router = useRouter()
  const [typeKey, setTypeKey] = useState(initialTypeKey ?? '')
  const type = useMemo(() => catalog.find((t) => t.key === typeKey), [catalog, typeKey])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<RequestPriority>('normal')
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({})
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  // One idempotency key per form instance: double taps and retries are safe.
  const idem = useRef(crypto.randomUUID())
  const draftId = useRef<string | null>(null)
  const draftPromise = useRef<Promise<string | null> | null>(null)

  function ensureDraft(): Promise<string | null> {
    if (!type) return Promise.resolve(null)
    draftPromise.current ??= createRequest({
      workspaceId, typeId: type.id, title: title || 'Untitled request', fields: answers, priority,
      idempotencyKey: idem.current, asDraft: true,
    }).then((r) => (r.ok ? (draftId.current = r.data.id) : null))
    return draftPromise.current
  }

  function submit() {
    if (!type) return
    setErrors({}); setFormError(null)
    start(async () => {
      // Same key as the draft (if files were added), so the server promotes it instead of duplicating.
      const res = await createRequest({
        workspaceId, typeId: type.id, title, fields: answers, priority,
        idempotencyKey: idem.current,
        asDraft: false,
      })
      if (!res.ok) {
        setFormError(res.error)
        if (res.fieldErrors) setErrors(res.fieldErrors)
        return
      }
      router.push(`${basePath}/${res.data.id}`)
    })
  }

  if (!type) {
    return (
      <div>
        <h2 className="font-serif text-2xl text-text">What do you need?</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {catalog.map((t) => (
            <li key={t.key}>
              <button type="button" onClick={() => setTypeKey(t.key)}
                className="h-full w-full rounded-md border border-border bg-bg p-4 text-left hover:border-border-strong focus-visible:outline-2 focus-visible:outline-accent">
                <span className="block text-base font-medium text-text">{t.name}</span>
                <span className="mt-1 block text-sm text-text-muted">{t.description}</span>
                <span className="mt-3 block font-mono text-xs text-text-faint">Usually within {t.slaHours >= 48 ? `${Math.round(t.slaHours / 24)} days` : `${t.slaHours} hours`}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex max-w-2xl flex-col gap-5" noValidate>
      <div>
        <button type="button" onClick={() => setTypeKey('')} className="text-sm text-text-muted hover:text-text">← Change type</button>
        <h2 className="mt-2 font-serif text-2xl text-text">{type.name}</h2>
      </div>

      <Field label="Short title" error={errors.title?.[0]} required>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} placeholder="e.g. Update the phone number on the contact page"
          className="h-11 w-full rounded-md border border-border-strong bg-bg px-3 text-base md:h-9 md:text-sm" />
      </Field>

      {type.fields.map((f) =>
        f.type === 'files' ? (
          <Field key={f.key} label={f.label}>
            <FileDropzone workspaceId={workspaceId} ensureRequestId={ensureDraft} />
          </Field>
        ) : (
          <Field key={f.key} label={f.label} help={f.help} required={f.required} error={errors[f.key]?.[0]}>
            <Input def={f} value={answers[f.key]} onChange={(v) => setAnswers((a) => ({ ...a, [f.key]: v }))} />
          </Field>
        ),
      )}

      <Field label="How soon?">
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <button key={p} type="button" role="radio" aria-checked={priority === p} onClick={() => setPriority(p)}
              className={`h-9 rounded-md border px-3 text-sm ${priority === p ? 'border-accent bg-accent-subtle text-accent-text' : 'border-border-strong text-text-muted'}`}>
              {PRIORITY_META[p].label}
            </button>
          ))}
        </div>
      </Field>

      {formError && <p role="alert" className="text-sm text-[color:var(--danger,#b3372b)]">{formError}</p>}
      <div className="sticky bottom-0 -mx-4 border-t border-border bg-bg px-4 py-3 md:static md:mx-0 md:border-0 md:p-0">
        <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-accent px-5 text-sm font-medium text-on-accent hover:bg-accent-hover disabled:opacity-60 md:h-9 md:w-auto">
          {pending ? 'Sending…' : 'Send request'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, help, error, required, children }: { label: string; help?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text">{label}{required && <span className="text-text-faint"> · required</span>}</span>
      {children}
      {help && <span className="text-xs text-text-muted">{help}</span>}
      {error && <span role="alert" className="text-xs text-[color:var(--danger,#b3372b)]">{error}</span>}
    </label>
  )
}

function Input({ def, value, onChange }: { def: FieldDefinition; value: string | boolean | undefined; onChange: (v: string | boolean) => void }) {
  const cls = 'w-full rounded-md border border-border-strong bg-bg px-3 text-base md:text-sm'
  switch (def.type) {
    case 'textarea':
      return <textarea rows={5} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} className={`${cls} py-2`} />
    case 'select':
      return (
        <select value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={`${cls} h-11 md:h-9`}>
          <option value="">Choose…</option>
          {(def.options ?? []).map((o) => <option key={o}>{o}</option>)}
        </select>
      )
    case 'toggle':
      return <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-5" />
    case 'date':
      return <input type="date" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={`${cls} h-11 md:h-9`} />
    case 'url':
      return <input type="url" inputMode="url" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder ?? 'https://'} className={`${cls} h-11 md:h-9`} />
    default:
      return <input value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} className={`${cls} h-11 md:h-9`} />
  }
}
