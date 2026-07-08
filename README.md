# LocalLead CRM

A full-stack local-business CRM for Ashish and Terri to find prospects, audit websites, track calls, add notes, and book meetings.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS with shadcn/ui-style local components
- Prisma ORM and PostgreSQL
- Simple email/password auth using hashed passwords and an HTTP-only cookie
- Google Places API via official Text Search
- Google PageSpeed Insights API

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Update `.env` with PostgreSQL and Google API keys:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/locallead_crm?schema=public"
GOOGLE_PLACES_API_KEY="..."
GOOGLE_PAGESPEED_API_KEY="..."
NEXTAUTH_SECRET="replace-me-with-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

4. Run migrations and seed demo users/leads:

```bash
npx prisma migrate dev
npm run prisma:seed
```

5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Seed login credentials:

- `ashish@arkitech.com` / `ARKITECH`
- `terri@arkitech.com` / `ARKITECH`
- `krish@arkitech.com` / `ARKITECH`
- `tio@arkitech.com` / `ARKITECH`

## Main Routes

- `/dashboard` - total leads, calls today, meetings, follow-ups, close rate, and pipeline cards
- `/leads` - Google Places lead finder with official API usage and save-to-CRM actions
- `/clients` - searchable CRM table with quick status updates
- `/clients/[id]` - business profile, notes timeline, call outcomes, follow-up dates, audit history
- `/audits` - standalone Google PageSpeed Insights audit view
- `/settings` - environment configuration checklist

## API Routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/leads/search`
- `GET /api/leads`
- `POST /api/leads`
- `GET /api/leads/[id]`
- `PATCH /api/leads/[id]`
- `POST /api/leads/[id]/notes`
- `POST /api/pagespeed`
- `GET /api/dashboard/stats`

If Google keys or PostgreSQL are not configured, read-only screens use demo fallback data so the interface remains explorable locally. Mutations require a configured database.
