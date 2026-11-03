'use server'

import type { Json } from '@/lib/db/types'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { answersSchema, parseRequestType } from '../domain/request-types'
import {
  addCommentInput,
  assignRequestInput,
  confirmUploadInput,
  createRequestInput,
  decideDeliverableInput,
  fromZodError,
  postDeliverableInput,
  requestUploadInput,
  transitionRequestInput,
  type ActionResult,
} from '../domain/schemas'
import { canActorTransition, type RequestStatus } from '../domain/status'
import {
  ALLOWED_MIME_TYPES,
  MAX_FILES_PER_REQUEST,
  MAX_FILE_BYTES,
  REQUEST_FILES_BUCKET,
  buildStoragePath,
} from '../domain/storage'
import { ForbiddenError, NotSignedInError, assertCanView, assertStaff, canApprove, getViewer } from './context'
import type { RequestRow, RequestTypeRow } from './types'

/**
 * Write side. Every action: parse input, resolve the viewer, check the rule,
 * write through the cookie-bound client (RLS is the real fence), return an
 * ActionResult. Nothing throws to the UI.
 */

async function run<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof NotSignedInError || e instanceof ForbiddenError) return { ok: false, error: e.message }
    console.error('[fulfillment]', e)
    return { ok: false, error: 'Something went wrong. Try again.' }
  }
}

function paths(workspaceSlug?: string, requestId?: string) {
  revalidatePath('/admin/fulfillment')
  if (workspaceSlug) {
    revalidatePath(`/w/${workspaceSlug}/requests`)
    if (requestId) revalidatePath(`/w/${workspaceSlug}/requests/${requestId}`)
  }
}

async function slugFor(workspaceId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('workspaces').select('slug').eq('id', workspaceId).maybeSingle()
  return (data as { slug: string } | null)?.slug
}

export async function createRequest(raw: unknown): Promise<ActionResult<{ id: string; number: number }>> {
  return run(async () => {
    const parsed = createRequestInput.safeParse(raw)
    if (!parsed.success) return fromZodError(parsed.error)
    const input = parsed.data
    const viewer = await getViewer()
    assertCanView(viewer, input.workspaceId)

    const supabase = await createClient()
    const { data: typeRow, error: typeErr } = await supabase.from('request_types').select('*').eq('id', input.typeId).single()
    if (typeErr || !typeRow) return { ok: false, error: 'That request type is not available' }
    const type = parseRequestType(typeRow as RequestTypeRow)

    // Drafts may be partial; submissions must satisfy the type's required fields.
    const schema = answersSchema(type.fields)
    const answers = input.asDraft ? input.fields : schema.safeParse(input.fields)
    if (!input.asDraft) {
      const res = answers as ReturnType<typeof schema.safeParse>
      if (!res.success) return fromZodError(res.error)
    }

    // Idempotent: a retry with the same key returns the original row. A draft
    // created for file uploads is promoted in place when the form is submitted.
    const existing = await supabase
      .from('requests')
      .select('id, number, status')
      .eq('workspace_id', input.workspaceId)
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle()
    if (existing.data) {
      const ex = existing.data as { id: string; number: number; status: RequestStatus }
      if (ex.status === 'draft') {
        const { error: upErr } = await supabase
          .from('requests')
          .update({
            title: input.title,
            description: input.description,
            fields: (input.asDraft ? input.fields : (answers as { data: Record<string, unknown> }).data) as NonNullable<Json>,
            priority: input.priority,
            status: input.asDraft ? 'draft' : 'submitted',
          })
          .eq('id', ex.id)
          .eq('status', 'draft')
        if (upErr) throw upErr
        paths(await slugFor(input.workspaceId), ex.id)
      }
      return { ok: true, data: { id: ex.id, number: ex.number } }
    }

    const { data, error } = await supabase
      .from('requests')
      .insert({
        workspace_id: input.workspaceId,
        type_id: input.typeId,
        title: input.title,
        description: input.description,
        fields: (input.asDraft ? input.fields : (answers as { data: Record<string, unknown> }).data) as NonNullable<Json>,
        priority: input.priority,
        status: input.asDraft ? 'draft' : 'submitted',
        requested_by: viewer.userId,
        idempotency_key: input.idempotencyKey,
        // `number` is filled in by the before-insert trigger
      } as never)
      .select('id, number')
      .single()
    if (error) {
      if (error.code === '23505') {
        // Lost a race with a concurrent retry: read the winner.
        const again = await supabase
          .from('requests').select('id, number')
          .eq('workspace_id', input.workspaceId).eq('idempotency_key', input.idempotencyKey).single()
        if (again.data) return { ok: true, data: again.data as { id: string; number: number } }
      }
      throw error
    }

    paths(await slugFor(input.workspaceId))
    return { ok: true, data: data as { id: string; number: number } }
  })
}

export async function transitionRequest(raw: unknown): Promise<ActionResult<{ status: RequestStatus }>> {
  return run(async () => {
    const parsed = transitionRequestInput.safeParse(raw)
    if (!parsed.success) return fromZodError(parsed.error)
    const { requestId, to, note } = parsed.data
    const viewer = await getViewer()
    const supabase = await createClient()

    const { data: row } = await supabase.from('requests').select('id, workspace_id, status').eq('id', requestId).maybeSingle()
    if (!row) return { ok: false, error: 'Request not found' }
    const req = row as Pick<RequestRow, 'id' | 'workspace_id' | 'status'>
    assertCanView(viewer, req.workspace_id)

    if (!canActorTransition(viewer.actor, req.status, to)) {
      return { ok: false, error: `You can't move this from ${req.status.replace('_', ' ')} to ${to.replace('_', ' ')}` }
    }
    const { error } = await supabase.from('requests').update({ status: to }).eq('id', requestId).eq('status', req.status)
    if (error) throw error

    if (note) {
      await supabase.from('request_comments').insert({
        workspace_id: req.workspace_id,
        request_id: requestId,
        author_id: viewer.userId,
        author_kind: viewer.actor,
        body: note,
      })
    }
    paths(await slugFor(req.workspace_id), requestId)
    return { ok: true, data: { status: to } }
  })
}

export async function assignRequest(raw: unknown): Promise<ActionResult> {
  return run(async () => {
    const parsed = assignRequestInput.safeParse(raw)
    if (!parsed.success) return fromZodError(parsed.error)
    assertStaff(await getViewer())
    const supabase = await createClient()
    const patch: { assigned_to: string | null; due_at?: string | null } = { assigned_to: parsed.data.assigneeId }
    if (parsed.data.dueAt !== undefined) patch.due_at = parsed.data.dueAt
    const { error } = await supabase.from('requests').update(patch).eq('id', parsed.data.requestId)
    if (error) throw error
    paths(undefined, parsed.data.requestId)
    return { ok: true, data: undefined }
  })
}

export async function addComment(raw: unknown): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const parsed = addCommentInput.safeParse(raw)
    if (!parsed.success) return fromZodError(parsed.error)
    const input = parsed.data
    const viewer = await getViewer()
    const supabase = await createClient()

    const { data: req } = await supabase.from('requests').select('workspace_id').eq('id', input.requestId).maybeSingle()
    if (!req) return { ok: false, error: 'Request not found' }
    const workspaceId = (req as { workspace_id: string }).workspace_id
    assertCanView(viewer, workspaceId)
    if (input.internal && !viewer.isStaff) return { ok: false, error: 'Only the team can leave internal notes' }

    const { data, error } = await supabase
      .from('request_comments')
      .insert({
        workspace_id: workspaceId,
        request_id: input.requestId,
        author_id: viewer.userId,
        author_kind: viewer.actor,
        body: input.body,
        internal: input.internal,
      })
      .select('id')
      .single()
    if (error) throw error

    // A client reply while we were waiting on them puts it back with the team.
    if (!viewer.isStaff) {
      await supabase.from('requests').update({ status: 'in_progress' }).eq('id', input.requestId).eq('status', 'awaiting_client')
    }
    paths(await slugFor(workspaceId), input.requestId)
    return { ok: true, data: data as { id: string } }
  })
}

export async function postDeliverable(raw: unknown): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const parsed = postDeliverableInput.safeParse(raw)
    if (!parsed.success) return fromZodError(parsed.error)
    const input = parsed.data
    assertStaff(await getViewer())
    const viewer = await getViewer()
    const supabase = await createClient()

    const { data: req } = await supabase.from('requests').select('workspace_id').eq('id', input.requestId).maybeSingle()
    if (!req) return { ok: false, error: 'Request not found' }
    const workspaceId = (req as { workspace_id: string }).workspace_id

    const { count } = await supabase
      .from('request_deliverables').select('id', { count: 'exact', head: true }).eq('request_id', input.requestId)

    const { data, error } = await supabase
      .from('request_deliverables')
      .insert({
        workspace_id: workspaceId,
        request_id: input.requestId,
        title: input.title,
        summary: input.summary,
        url: input.url || null,
        version: (count ?? 0) + 1,
        posted_by: viewer.userId,
      })
      .select('id')
      .single()
    if (error) throw error
    const id = (data as { id: string }).id

    if (input.attachmentIds.length) {
      await supabase.from('request_attachments').update({ deliverable_id: id }).in('id', input.attachmentIds).eq('request_id', input.requestId)
    }
    paths(await slugFor(workspaceId), input.requestId)
    return { ok: true, data: { id } }
  })
}

export async function decideDeliverable(raw: unknown): Promise<ActionResult> {
  return run(async () => {
    const parsed = decideDeliverableInput.safeParse(raw)
    if (!parsed.success) return fromZodError(parsed.error)
    const input = parsed.data
    const viewer = await getViewer()
    const supabase = await createClient()

    const { data: d } = await supabase
      .from('request_deliverables').select('workspace_id, request_id, status').eq('id', input.deliverableId).maybeSingle()
    if (!d) return { ok: false, error: 'Deliverable not found' }
    const del = d as { workspace_id: string; request_id: string; status: string }
    if (!canApprove(viewer, del.workspace_id)) return { ok: false, error: 'Only your account owner or an admin can approve work' }
    if (del.status !== 'pending') return { ok: false, error: 'This has already been decided' }

    const { error } = await supabase
      .from('request_deliverables')
      .update({ status: input.decision, decided_by: viewer.userId, decision_note: input.note ?? null })
      .eq('id', input.deliverableId)
      .eq('status', 'pending')
    if (error) throw error
    paths(await slugFor(del.workspace_id), del.request_id)
    return { ok: true, data: undefined }
  })
}

/**
 * Upload step 1: validate and mint a signed upload URL. The browser PUTs the
 * file straight to Storage (no proxying through the server), then calls
 * confirmUpload to record the row.
 */
export async function requestUpload(raw: unknown): Promise<ActionResult<{ attachmentId: string; path: string; token: string }>> {
  return run(async () => {
    const parsed = requestUploadInput.safeParse(raw)
    if (!parsed.success) return fromZodError(parsed.error)
    const input = parsed.data
    const viewer = await getViewer()
    assertCanView(viewer, input.workspaceId)

    if (input.sizeBytes > MAX_FILE_BYTES) return { ok: false, error: 'Files can be up to 100 MB' }
    if (input.sizeBytes === 0) return { ok: false, error: 'That file is empty' }
    if (!ALLOWED_MIME_TYPES.has(input.mimeType)) return { ok: false, error: `We can't accept ${input.mimeType} files` }

    const supabase = await createClient()
    const { data: req } = await supabase.from('requests').select('workspace_id').eq('id', input.requestId).maybeSingle()
    if (!req || (req as { workspace_id: string }).workspace_id !== input.workspaceId) {
      return { ok: false, error: 'Request not found' }
    }
    const { count } = await supabase
      .from('request_attachments').select('id', { count: 'exact', head: true }).eq('request_id', input.requestId)
    if ((count ?? 0) >= MAX_FILES_PER_REQUEST) return { ok: false, error: `Up to ${MAX_FILES_PER_REQUEST} files per request` }

    const attachmentId = randomUUID()
    const path = buildStoragePath(input.workspaceId, input.requestId, attachmentId, input.fileName)
    const { data, error } = await supabase.storage.from(REQUEST_FILES_BUCKET).createSignedUploadUrl(path)
    if (error) throw error
    return { ok: true, data: { attachmentId, path, token: data.token } }
  })
}

/** Upload step 2: record the row once the object exists. */
export async function confirmUpload(raw: unknown): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const parsed = confirmUploadInput.safeParse(raw)
    if (!parsed.success) return fromZodError(parsed.error)
    const input = parsed.data
    const viewer = await getViewer()
    const supabase = await createClient()

    const { data: req } = await supabase.from('requests').select('workspace_id').eq('id', input.requestId).maybeSingle()
    if (!req) return { ok: false, error: 'Request not found' }
    const workspaceId = (req as { workspace_id: string }).workspace_id
    assertCanView(viewer, workspaceId)

    // The path must be the one we minted for this workspace, request and id.
    const expectedPrefix = `${workspaceId}/${input.requestId}/${input.attachmentId}/`
    if (!input.storagePath.startsWith(expectedPrefix)) return { ok: false, error: 'Upload does not match this request' }

    const { data, error } = await supabase
      .from('request_attachments')
      .upsert(
        {
          id: input.attachmentId,
          workspace_id: workspaceId,
          request_id: input.requestId,
          deliverable_id: input.deliverableId ?? null,
          uploaded_by: viewer.userId,
          uploaded_by_kind: viewer.actor,
          storage_path: input.storagePath,
          file_name: input.fileName,
          mime_type: input.mimeType,
          size_bytes: input.sizeBytes,
        },
        { onConflict: 'id', ignoreDuplicates: true },
      )
      .select('id')
      .maybeSingle()
    if (error) throw error
    paths(await slugFor(workspaceId), input.requestId)
    return { ok: true, data: { id: (data as { id: string } | null)?.id ?? input.attachmentId } }
  })
}

export async function removeAttachment(attachmentId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = await createClient()
    const { data: a } = await supabase.from('request_attachments').select('storage_path, workspace_id, request_id').eq('id', attachmentId).maybeSingle()
    if (!a) return { ok: true, data: undefined }
    const att = a as { storage_path: string; workspace_id: string; request_id: string }
    const { error: delErr } = await supabase.from('request_attachments').delete().eq('id', attachmentId)
    if (delErr) throw delErr
    await supabase.storage.from(REQUEST_FILES_BUCKET).remove([att.storage_path])
    paths(await slugFor(att.workspace_id), att.request_id)
    return { ok: true, data: undefined }
  })
}
