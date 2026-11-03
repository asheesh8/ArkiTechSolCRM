/**
 * Storage layout for request files.
 *
 *   bucket: request-files
 *   key:    {workspaceId}/{requestId}/{attachmentId}/{safeFileName}
 *
 * The first segment is the tenant boundary that the Storage RLS policies in
 * 20261103010300_fulfillment_storage.sql check. Nothing else may write here.
 */

export const REQUEST_FILES_BUCKET = 'request-files'
export const MAX_FILE_BYTES = 100 * 1024 * 1024
export const MAX_FILES_PER_REQUEST = 25

/** Mirrors the bucket's allowed_mime_types; keep both lists in sync. */
export const ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/heic',
  'application/pdf',
  'application/zip', 'application/x-zip-compressed',
  'video/mp4', 'video/quicktime', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/m4a',
  'text/plain', 'text/csv', 'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/postscript', 'application/illustrator', 'image/vnd.adobe.photoshop',
  'application/octet-stream',
])

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Strip path tricks and odd characters; keep the extension readable. */
export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'file'
  const cleaned = base
    .normalize('NFKD')
    .replace(/[^\w.\- ()]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
  const limited = cleaned.length > 120 ? cleaned.slice(-120) : cleaned
  return limited.length > 0 ? limited : 'file'
}

export function buildStoragePath(workspaceId: string, requestId: string, attachmentId: string, fileName: string): string {
  for (const [label, v] of [['workspaceId', workspaceId], ['requestId', requestId], ['attachmentId', attachmentId]] as const) {
    if (!UUID_RE.test(v)) throw new Error(`${label} must be a uuid`)
  }
  return `${workspaceId}/${requestId}/${attachmentId}/${safeFileName(fileName)}`
}

export interface ParsedStoragePath {
  workspaceId: string
  requestId: string
  attachmentId: string
  fileName: string
}

export function parseStoragePath(path: string): ParsedStoragePath | null {
  const parts = path.split('/')
  if (parts.length !== 4) return null
  const [workspaceId, requestId, attachmentId, fileName] = parts
  if (![workspaceId, requestId, attachmentId].every((p) => UUID_RE.test(p))) return null
  if (!fileName) return null
  return { workspaceId, requestId, attachmentId, fileName }
}

export type FileCheck = { ok: true } | { ok: false; reason: string }

export function checkFile(file: { name: string; type: string; size: number }): FileCheck {
  if (file.size > MAX_FILE_BYTES) return { ok: false, reason: `${file.name} is over 100 MB` }
  if (file.size === 0) return { ok: false, reason: `${file.name} is empty` }
  const type = file.type || 'application/octet-stream'
  if (!ALLOWED_MIME_TYPES.has(type)) return { ok: false, reason: `${file.name}: we can't accept ${type} files` }
  return { ok: true }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function isImage(mime: string): boolean {
  return mime.startsWith('image/') && mime !== 'image/vnd.adobe.photoshop'
}
