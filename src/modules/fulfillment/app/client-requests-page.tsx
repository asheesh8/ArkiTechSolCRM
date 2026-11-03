import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRequestCounts, getWorkspaceBySlug, listRequests } from '../data/queries'
import { countWaitingOnClient, type RequestStatus } from '../domain/status'
import { RequestList } from '../ui/request-list'

/** Mount at app/[workspace]/requests/page.tsx */
export async function ClientRequestsPage({ workspaceSlug, filter = 'open' }: { workspaceSlug: string; filter?: 'open' | 'closed' }) {
  const ws = await getWorkspaceBySlug(workspaceSlug)
  if (!ws) notFound()
  const [page, counts] = await Promise.all([
    listRequests({ workspaceId: ws.id, status: filter, limit: 50 }),
    getRequestCounts(ws.id),
  ])
  const waiting = countWaitingOnClient(Object.entries(counts).flatMap(([s, n]) => Array<RequestStatus>(n).fill(s as RequestStatus)))
  const base = `/w/${ws.slug}/requests`
  return (
    <div className="mx-auto max-w-5xl py-6">
      <header className="flex items-end justify-between gap-4 px-4">
        <div>
          <h1 className="font-serif text-3xl text-text">Requests</h1>
          {waiting > 0 && <p className="mt-1 text-sm text-accent-text">{waiting} waiting on you</p>}
        </div>
        <Link href={`${base}/new`} className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent-hover">New request</Link>
      </header>
      <nav className="mt-4 flex gap-4 border-b border-border px-4 text-sm" aria-label="Filter">
        {(['open', 'closed'] as const).map((f) => (
          <Link key={f} href={f === 'open' ? base : `${base}?show=closed`} aria-current={filter === f ? 'page' : undefined}
            className={`-mb-px border-b-2 pb-2 ${filter === f ? 'border-accent text-text' : 'border-transparent text-text-muted'}`}>
            {f === 'open' ? 'Open' : 'Done'}
          </Link>
        ))}
      </nav>
      <RequestList items={page.items} basePath={base} audience="client" />
    </div>
  )
}
