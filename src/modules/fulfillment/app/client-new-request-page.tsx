import { notFound } from 'next/navigation'
import { getRequestCatalog, getWorkspaceBySlug } from '../data/queries'
import { RequestForm } from '../ui/request-form'

/** Mount at app/[workspace]/requests/new/page.tsx */
export async function ClientNewRequestPage({ workspaceSlug, type }: { workspaceSlug: string; type?: string }) {
  const ws = await getWorkspaceBySlug(workspaceSlug)
  if (!ws) notFound()
  const catalog = await getRequestCatalog(ws.id)
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <RequestForm workspaceId={ws.id} basePath={`/w/${ws.slug}/requests`} catalog={catalog} initialTypeKey={type} />
    </div>
  )
}
