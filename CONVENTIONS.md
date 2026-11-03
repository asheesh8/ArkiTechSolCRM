# ArkiTech Portal: conventions

Read this before building a module. It is short on purpose. If something here and the code disagree, the code wins and this file is wrong; fix it.

## What this is

A multi-tenant client portal. ArkiTech owns the platform; each client company is a **workspace** with its own brand, members, modules and data. Next.js 16 (App Router, `proxy.ts` not middleware), React 19, Tailwind 4, Supabase (Postgres + Auth + Storage + Realtime), Zod, TypeScript. Read `node_modules/next/dist/docs/` before using a Next API you are not sure about; this is not the Next you remember.

## Run it

```bash
pnpm install
npx supabase start          # Docker; applies supabase/migrations then supabase/seed.sql
pnpm dev                    # http://localhost:3000
```

Demo logins, all with password `portal-demo`:

| Email | Is |
| --- | --- |
| ashish@arkitech-sol.com | ArkiTech staff owner (sees every workspace and `/admin`) |
| terri@arkitech-sol.com | ArkiTech staff member |
| maya@harbordental.com | owner of Harbor Dental (fully onboarded, add-ons, data) |
| sam@harbordental.com | member of Harbor Dental (write on crm and requests; `finance: none`) |
| lee@greenlinelandscape.com | owner of Greenline (has not finished onboarding) |

Locally the root domain is `localhost:3000`. Workspaces live at `/w/<slug>`; `acme.localhost:3000` also works in Chrome. `/admin` is the staff console.

## Folder layout

```
src/app/                       routes only: thin pages that call into modules
  w/[slug]/(portal)/           the client portal; layout loads tenant + theme + shell
    <module path>/page.tsx     one folder per module route (wins over [module] placeholder)
  w/[slug]/onboarding/         first-run flow (outside the shell)
  admin/                       ArkiTech staff console (staff only)
  api/                         route handlers (webhooks and public endpoints under api/public, api/webhooks)
  login, auth/                 sign-in, magic link callback, sign-out
src/modules/<key>/             everything a module owns
  manifest/registry entry      in src/modules/registry.ts (one line per module)
  page.tsx, components/        UI
  queries.ts                   reads (take the user's Supabase client; RLS applies)
  actions.ts                   "use server" mutations
src/components/ui/             the design system. Use it. Don't make a second button.
src/components/shell/          app shell, command palette
src/lib/supabase/              server.ts (user session), admin.ts (service role), client.ts (browser)
src/lib/tenant/                context.ts (getTenant, requireModule), host.ts
src/lib/theme/accent.ts        per-workspace colour ladder
src/lib/actions.ts             ActionResult, parseInput, withIdempotency, audit
src/lib/db/types.ts            generated: `npx supabase gen types typescript --local > src/lib/db/types.ts`
supabase/migrations/           one new timestamped file per change; never edit an applied one
supabase/seed.sql              local demo data
```

## Adding a module

1. Add a row to `MODULES` in `src/modules/registry.ts` (key, label, icon, path, kind core|addon, nav, permission). The key must match a row in the `modules` table (seeded in the init migration; add yours in a new migration).
2. Create `src/app/w/[slug]/(portal)/<path>/page.tsx`:
   ```tsx
   export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
     const { slug } = await params;
     const tenant = await requireModule(slug, "crm");   // 404/redirect if the workspace doesn't have it
     return <CrmPage tenant={tenant} />;
   }
   ```
3. Put reads in `queries.ts`, writes in `actions.ts` (each action starts with `requireModule(slug, key, { write: true })`).
4. Any new table goes in a migration and ends with `select apply_tenant_policies('<table>', '<module permission key>');` (see below). Regenerate `types.ts`.
5. Seed a little demo data for Harbor Dental in `supabase/seed.sql`.

The sidebar shows a module only if the workspace has it. Add-ons a workspace lacks are sold on Billing, never shown as locked nav.

## Tenancy and security (the part that matters)

* Every tenant table has `workspace_id uuid not null references workspaces on delete cascade` and row-level security. **Nothing in application code is trusted to filter by tenant**; the database does it.
* `select apply_tenant_policies('table', 'module')` creates the four standard policies: staff can do anything, members can read their workspace's rows, and can write if they are owner/admin or their `memberships.permissions->>module` is `write`.
* Helper functions (all `security definer`, fixed search_path): `is_staff()`, `is_member(ws)`, `member_role(ws)`, `is_workspace_admin(ws)`, `can_write(ws, module)`, `my_workspace_ids()`. Use these in custom policies. Never write a policy that joins `memberships` directly (it recurses).
* Use `createClient()` from `@/lib/supabase/server` whenever a user is acting: queries run under RLS. Use `createAdminClient()` (service role, bypasses RLS) **only** for webhooks, cron, public chatbot endpoints and provisioning, and always filter by `workspace_id` yourself.
* Composite integrity: child rows carry `workspace_id` too (comments, messages) so policies stay one hop and a row can never point across tenants.
* Idempotent writes: mutations that must not run twice (webhooks, uploads, add-on toggles) use `withIdempotency(key, workspaceId, fn)` or an `on conflict` upsert on a natural key. Webhooks record their event id in `webhook_events` first.
* Human-friendly numbers (request #12, invoice #3) come from `next_counter(ws, 'name')`, a per-workspace counter.
* Files go in Storage under `<workspace_id>/…`; the first path segment is what the storage policies check. Private bucket `workspace-files`, public bucket `brand`.
* Money is integer cents. Times are `timestamptz`. Don't store derived numbers you can compute.

## Server actions

```ts
"use server";
export async function createThing(slug: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const tenant = await requireModule(slug, "crm", { write: true });
  const p = parseInput(schema, input);      // Zod; returns field errors
  if (!p.ok) return p;
  ...insert with the user's client...
  await audit(tenant.workspace.id, "crm.contact.created", "contact", id);
  return ok({ id });
}
```

Return `ok(data)` / `fail(message, fieldErrors?)`. Never throw for expected failures. Never trust `slug` or ids from the client without going through `requireModule` (RLS is the second lock, not the first).

## Design system

Calm, architectural, and to the point. One accent, used only where something is waiting on the client or for the primary action. Hairlines, not shadows; no glass, no gradients, no scroll animation.

* Tokens live in `src/app/globals.css`. Use the semantic Tailwind names: `bg-bg`, `bg-bg-subtle`, `bg-surface`, `bg-control`, `border-border`, `border-input`, `text-text`, `text-text-muted`, `text-text-faint`, `bg-accent`, `text-on-accent`, `bg-accent-subtle`, `text-accent-text`, `text-success|warning|danger`. Never raw hex or `zinc-*`. The accent ladder is regenerated per workspace, so anything that uses these tokens re-themes for free.
* Type: `font-sans` (Schibsted Grotesk) for everything; `font-serif` (Libre Caslon Display) for the page title and key numbers only; `font-mono` (DM Mono) for labels, ids, dates and money in tables. Base text is 14px. Never bold above 600.
* Components (`@/components/ui`): `Button` (primary is the accent, one per view), `Input/Textarea/Select/Field/Toggle/Checkbox`, `Card/CardHeader/CardTitle/CardBody`, `Badge` (a dot and a word, never a filled pill), `Chip`, `Stat/StatGrid` (with sparkline), `Empty`, `Table`, `PageHeader/Section`, `Avatar`, `Sheet` (right panel on desktop, full height on phones), `Dialog`, `Tabs/Segmented`, `Sparkline`, `Mark/Lockup`.
* Status language, not system language: "Waiting on you", "We're on it", "Done", never "Pending". Buttons say what happens: "Send request", "Pay $400".
* Every data region has four states: loading (skeleton shaped like the content), empty (one line and one action), error (say what failed and offer retry), full.
* Phones: at `<md` the sidebar becomes a bottom tab bar (4 modules + More); lists become card lists, not squeezed tables; detail opens as a full-height sheet; controls are 36px+ and inputs are 16px so iOS doesn't zoom. Test at 390px.
* Motion: 150–240ms, `--ease`/`--ease-out`, opacity and small translate only, off under `prefers-reduced-motion` (handled globally).

## Billing and entitlements

`modules` (catalog + price), `workspace_modules` (what a workspace has: included, active, trial, paused, cancelled), `automations`, `workspace_automations`. A workspace "has" a module when its status is included, active or trial. Turning an add-on on or off is the billing module's job (Stripe subscription items); everything else just asks `tenant.has("calendar")`.

Chatbot is metered: $50/mo includes 2,000 messages, then $25 per extra 1,000 (`modules.metered`). `workspace_modules.usage_count` counts messages in the current period.

## Open decisions (don't build around them)

* **Twilio account model**: ArkiTech registering clients as an ISV vs each client using their own Twilio account is undecided. Store registration data in `sms_registrations` (done); keep anything provider-specific in its `twilio` jsonb and behind one module boundary.
* Automated calls: not happening. Texts only.

## Don'ts

No new design tokens or fonts. No `any`. No client-side tenant filtering. No editing applied migrations. No secrets in the repo (use `.env.local`, which is git-ignored).
