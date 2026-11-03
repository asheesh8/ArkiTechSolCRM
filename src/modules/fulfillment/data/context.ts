import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Actor } from '../domain/status'

/**
 * Who is calling. Resolved once per request (React cache) from the session
 * plus the core's `profiles` and `workspace_members` tables.
 *
 * Expected from the core scaffold:
 *   - `@/lib/supabase/server` exporting `createClient()` (cookie-bound, RLS on)
 *   - `profiles.is_staff` for the Arkitech team
 *   - `workspace_members(workspace_id, user_id, role)`
 */

import type { Viewer } from './context-shared'
import { canApprove, membershipFor } from './context-shared'
export type { Viewer }
export { canApprove, membershipFor }

export class NotSignedInError extends Error {
  constructor() {
    super('Sign in to continue')
  }
}
export class ForbiddenError extends Error {
  constructor(msg = 'You do not have access to that') {
    super(msg)
  }
}

export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new NotSignedInError()

  const [{ data: profile }, { data: members }] = await Promise.all([
    supabase.from('profiles').select('is_staff').eq('id', user.id).maybeSingle(),
    supabase.from('workspace_members').select('workspace_id, role').eq('user_id', user.id),
  ])
  const isStaff = Boolean((profile as { is_staff?: boolean } | null)?.is_staff)
  return {
    userId: user.id,
    isStaff,
    actor: isStaff ? 'team' : 'client',
    memberships: ((members ?? []) as Array<{ workspace_id: string; role: 'owner' | 'admin' | 'member' }>).map((m) => ({
      workspaceId: m.workspace_id,
      role: m.role,
    })),
  }
})

export function assertCanView(viewer: Viewer, workspaceId: string) {
  if (viewer.isStaff) return
  if (!membershipFor(viewer, workspaceId)) throw new ForbiddenError()
}

export function assertStaff(viewer: Viewer) {
  if (!viewer.isStaff) throw new ForbiddenError('Only the Arkitech team can do that')
}
