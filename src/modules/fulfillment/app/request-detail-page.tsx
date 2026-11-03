import { notFound } from 'next/navigation'
import { getViewer } from '../data/context'
import { getAttachmentUrl, getRequest, listStaff } from '../data/queries'
import { RequestDetailView } from '../ui/request-detail'
import { TeamControls } from '../ui/team-controls'

/**
 * Mount at app/[workspace]/requests/[id]/page.tsx (clients) and
 * app/team/fulfillment/[id]/page.tsx (team). Same view, the viewer decides
 * what shows.
 */
export async function RequestDetailPage({ requestId }: { requestId: string }) {
  const [request, viewer] = await Promise.all([getRequest(requestId), getViewer()])
  if (!request) notFound()

  const all = [...request.attachments, ...request.deliverables.flatMap((d) => d.attachments)]
  const entries = await Promise.all(all.map(async (a) => [a.id, await getAttachmentUrl(a.storage_path)] as const))
  const urls = Object.fromEntries(entries)

  const staff = viewer.isStaff ? await listStaff() : []
  return (
    <RequestDetailView
      request={request}
      viewer={viewer}
      urls={urls}
      teamPanel={viewer.isStaff ? (
        <TeamControls requestId={request.id} workspaceId={request.workspace_id} status={request.status} assigneeId={request.assigned_to} staff={staff} />
      ) : undefined}
    />
  )
}
