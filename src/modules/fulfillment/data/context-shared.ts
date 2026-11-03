import type { Actor } from '../domain/status'

/** Client-safe viewer shape and rules (no server-only imports). */
export interface Viewer {
  userId: string
  isStaff: boolean
  actor: Actor
  memberships: Array<{ workspaceId: string; role: 'owner' | 'admin' | 'member' }>
}

export function membershipFor(viewer: Viewer, workspaceId: string) {
  return viewer.memberships.find((m) => m.workspaceId === workspaceId) ?? null
}

export function canApprove(viewer: Viewer, workspaceId: string): boolean {
  if (viewer.isStaff) return false
  const role = membershipFor(viewer, workspaceId)?.role
  return role === 'owner' || role === 'admin'
}
