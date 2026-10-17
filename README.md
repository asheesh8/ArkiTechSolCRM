# ArkiTech Solutions — Website & CRM

One Next.js app that serves two audiences:

- **The public marketing site** for ArkiTech Solutions, a Burlington, Vermont web and AI studio — services, pricing, service areas, blog, and the `/cleaningbook` ad-campaign landing page.
- **The internal CRM** the team uses to find local-business leads, cold-call and text them, run AI voice agents, manage clients and contracts, and bill through a client portal.

**Live:** https://sol-arkitech.com (Vercel project: `arki-tech-sol-crm.vercel.app`)

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4, local shadcn-style components (`src/components/ui`) |
| Data | PostgreSQL via Prisma 6 |
| Auth | Email + bcrypt password; opaque session token in an HTTP-only cookie, only its SHA-256 hash stored in `StaffSession` |
| Telephony | Twilio Voice SDK (browser dialling), Twilio + Blooio for SMS/iMessage |
| AI | OpenAI Realtime + Whisper, ElevenLabs agents, Base44 FAQ agent |
| Payments / email / files | Stripe, Resend, Cloudflare R2 (S3 API) |
| Lead data | Google Places Text Search, Google PageSpeed Insights |
| Hosting | Vercel |

## Project layout

```
src/app/(site)/     Public marketing pages (shared layout in (site)/layout.tsx)
src/app/(crm)/      Staff CRM — every page is behind the login check in (crm)/layout.tsx
src/app/portal/     Client portal (separate cookie and login from staff)
src/app/sign/       Public e-signature page reached by a one-time token
src/app/cleaningbook, demo, videodemo   Standalone campaign / demo pages
src/app/api/        Route handlers, grouped by feature
src/components/     UI, grouped by area (crm, marketing, notes, portal, ...)
src/lib/            Server-side logic: auth, integrations, pricing, schemas
prisma/             Schema, migrations, seed script
scripts/            Build-time migration runner and one-off maintenance scripts
docs/               Hand-off notes for design and asset work
```

### Roles

Staff users have one of three roles, enforced server-side by `requireRoles()` in `src/lib/route-guard.ts` (the sidebar only hides links; the guard is what protects the page):

- **OWNER** — everything, including team management, analytics, campaigns and voice agents.
- **MEMBER** — sales work: leads, cold calls, clients, accountability.
- **DEV** — work requests and the Build Studio (`/demos`).

## Local setup

Requires Node 20+, pnpm, and a PostgreSQL database.

```bash
pnpm install              # also runs `prisma generate`
cp .env.example .env      # then fill in the values you need (see below)
pnpm prisma migrate dev   # create the schema
pnpm prisma:seed          # create the staff accounts and demo leads
pnpm dev                  # http://localhost:3000
```

The seed creates the staff accounts with the password in `SEED_ADMIN_PASSWORD`. Never commit real passwords to this repo.

If PostgreSQL or the Google keys are missing, read-only screens fall back to demo data so the UI is still explorable. Anything that writes needs a database.

## Environment variables

`.env.example` documents each variable in detail. Names only here — never commit values.

| Group | Variables |
|---|---|
| Core | `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `SEED_ADMIN_PASSWORD` |
| Google | `GOOGLE_PLACES_API_KEY`, `GOOGLE_PAGESPEED_API_KEY`, `GOOGLE_CALENDAR_ID`, `GOOGLE_CALENDAR_IDS`, `GOOGLE_CALENDAR_EMBED_URL`, `GOOGLE_CALENDAR_API_KEY`, `GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_CALENDAR_PRIVATE_KEY`, `GOOGLE_CALENDAR_SUBJECT` |
| AI agents | `OPENAI_API_KEY`, `OPENAI_REALTIME_MODEL`, `OPENAI_TRANSCRIBE_MODEL`, `OPENAI_SUMMARY_MODEL`, `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID`, `ELEVENLABS_WEBHOOK_SECRET`, `BASE44_API_KEY`, `BASE44_AGENT_ID`, `BASE44_CONVERSATION_ID`, `DEMO_IP_SALT` |
| Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_AUTH_TOKEN`, `TWILIO_TWIML_APP_SID`, `TWILIO_CALLER_ID`, `TWILIO_VOICE_WEBHOOK_URL`, `TWILIO_RECORD_CALLS`, `TWILIO_CONSENT_ANNOUNCEMENT`, `CREDENTIAL_ENCRYPTION_KEY` |
| Blooio | `BLOOIO_API_KEY`, `BLOOIO_FROM_NUMBER`, `BLOOIO_API_BASE` |
| Billing / email / files | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` |
| Analytics / campaign | `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_BOOKING_URL` |
| Build Studio deploys | `GITHUB_TOKEN`, `GITHUB_ORG`, `GITHUB_REFERENCE_OWNER`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID` |

Only `NEXT_PUBLIC_*` variables reach the browser; everything else must stay server-side. `NEXTAUTH_SECRET` / `NEXTAUTH_URL` in `.env.example` are left over from an earlier version — the app no longer reads them.

> **Call recording is off by default.** Read the notes on `TWILIO_RECORD_CALLS` in `.env.example` before enabling it — several states require every party's consent.

## Deploying

- Pushing to `main` deploys to production on Vercel; other branches get preview deployments.
- `pnpm build` runs `scripts/migrate-on-build.mjs` first, which applies pending Prisma migrations when `DATABASE_URL` is set and skips (with a loud log line) when it is not. Add schema changes as a new migration in `prisma/migrations/`; never edit one that has already shipped.
- Stripe and ElevenLabs webhooks point at `/api/webhooks/stripe` and `/api/webhooks/elevenlabs`. The Twilio TwiML app's Voice URL must be `<public URL>/api/calls/voice`.

## Notes for contributors

- This project pins a recent Next.js with breaking changes from older versions — see `AGENTS.md` and check `node_modules/next/dist/docs/` before relying on older patterns.
- Server-only modules start with `import "server-only"`; keep secrets and Prisma calls behind that line.
