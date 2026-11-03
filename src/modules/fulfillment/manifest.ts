/**
 * Module manifest. The core's module registry reads this to build nav,
 * routes and entitlement checks. Fulfillment is part of the base plan, so
 * it needs no add-on entitlement.
 */
export const fulfillmentModule = {
  id: 'fulfillment',
  name: 'Requests',
  description: 'Send us work, files and changes. Approve what we deliver.',
  icon: 'inbox',
  /** null = included in every plan. Add-ons list their SKU here. */
  entitlement: null as string | null,
  nav: {
    client: { label: 'Requests', href: (slug: string) => `/w/${slug}/requests`, mobileTab: true },
    team: { label: 'Fulfillment', href: () => '/admin/fulfillment' },
  },
  routes: {
    client: ['/[workspace]/requests', '/[workspace]/requests/new', '/[workspace]/requests/[id]'],
    team: ['/admin/fulfillment', '/admin/fulfillment/[id]'],
  },
  /** Home-screen widget key the core dashboard can resolve. */
  homeWidget: 'fulfillment.waiting-on-you',
  storageBuckets: ['request-files'],
  notificationTemplates: [
    'request.submitted',
    'request.status.in_progress',
    'request.status.awaiting_client',
    'request.status.delivered',
    'request.status.completed',
    'request.status.on_hold',
    'request.status.cancelled',
    'request.comment',
    'deliverable.approved',
    'deliverable.changes_requested',
  ],
} as const
