import Link from 'next/link'
import { assertStaff, getViewer } from '../data/context'
import { listRequests } from '../data/queries'
import { PipelineBoard } from '../ui/pipeline-board'
import { RequestList } from '../ui/request-list'

/** Mount at app/admin/fulfillment/page.tsx. Cross-tenant, staff only. */
export async function TeamBoardPage({ view = 'board' }: { view?: 'board' | 'list' }) {
  assertStaff(await getViewer())
  const page = await listRequests({ status: 'open', limit: 100 })
  return (
    <div className="py-6">
      <header className="flex items-end justify-between px-4 md:px-0">
        <h1 className="font-serif text-3xl text-text">Fulfillment</h1>
        <nav className="flex gap-1 text-sm" aria-label="View">
          {(['board', 'list'] as const).map((v) => (
            <Link key={v} href={`?view=${v}`} aria-current={view === v ? 'page' : undefined}
              className={`rounded-md px-3 py-1 ${view === v ? 'bg-bg-subtle text-text' : 'text-text-muted'}`}>{v === 'board' ? 'Board' : 'List'}</Link>
          ))}
        </nav>
      </header>
      <div className="mt-4">
        {view === 'board'
          ? <PipelineBoard items={page.items} basePath="/admin/fulfillment" />
          : <RequestList items={page.items} basePath="/admin/fulfillment" audience="team" />}
      </div>
    </div>
  )
}
