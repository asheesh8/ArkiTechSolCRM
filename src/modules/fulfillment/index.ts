/**
 * Fulfillment module public surface. The core app imports from here only.
 * Server-only pieces live behind `./server` so client bundles stay clean.
 */
export * from './domain/status'
export * from './domain/request-types'
export * from './domain/storage'
export { renderNotification, resolveAudience, describeEvent } from './domain/events'
export type { OutboxRow, RenderContext } from './domain/events'
export { fulfillmentModule } from './manifest'
