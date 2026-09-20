-- ArkiTech work log backfill — Sat 12 Sep to Sat 19 Sep 2026
-- 15 sessions, 20.75 hours, drawn from 27 commits across 6 repos.
--
-- Times are stored UTC because that is what Prisma writes; the app renders them
-- back in America/New_York. Do not "correct" them to local or every block moves
-- four hours.
--
-- Run the three steps in order. Step 2 deletes EVERY owner's rows, Terri's too.

-- ---------------------------------------------------------------------------
-- STEP 1 — back up what is there now. Run it, then export the result to CSV
-- and keep the file. Step 2 is not reversible without it.
-- ---------------------------------------------------------------------------
SELECT w.*, u.name, u.email
FROM "OwnerWorkLog" w
JOIN "User" u ON u.id = w."userId"
ORDER BY w."startedAt";


-- ---------------------------------------------------------------------------
-- STEP 2 — clear the old entries. Skip this to keep them and just add the week.
-- ---------------------------------------------------------------------------
DELETE FROM "OwnerWorkLog";


-- ---------------------------------------------------------------------------
-- STEP 3 — insert the week. Change the email on the line marked below if your
-- production login differs; everything else needs no edits. Postgres generates
-- the ids, and the user is resolved by email so no id has to be pasted in.
-- ---------------------------------------------------------------------------
INSERT INTO "OwnerWorkLog"
  ("id", "userId", "startedAt", "endedAt", "workSummary", "kind", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u."id",
  v.started,
  v.ended,
  v.summary,
  'COMPANY'::"WorkLogKind",
  now(),
  now()
FROM (
  SELECT "id" FROM "User"
  WHERE "email" = 'ashish@arkitech.com'   -- <<< your production login email
) AS u
CROSS JOIN (VALUES
    (TIMESTAMP '2026-09-13 01:30:00', TIMESTAMP '2026-09-13 03:30:00', 'Elite Real Estate — finished the other tool''s pass and restored what it had removed, wrote one roadmap covering everything left including Phase 2, and rewrote ''Elite by the Numbers'' in Darcy''s own wording. Three commits.'),
    (TIMESTAMP '2026-09-14 19:30:00', TIMESTAMP '2026-09-14 21:30:00', 'GawahiTv — added the Gawahi Live channel and hardened the site for launch. One commit; the rest of the block was pre-launch checks across pages, playback and error states.'),
    (TIMESTAMP '2026-09-16 12:30:00', TIMESTAMP '2026-09-16 14:30:00', 'Elite Real Estate — Darcy''s logo everywhere and dropped the single-office framing; put Darcy first with Brandon beside her; her bio verbatim including ''equal partner''; copy fixes from her review; published the 5.0 from 92 reviews Google rating. Five commits off the back of Darcy''s review.'),
    (TIMESTAMP '2026-09-16 14:35:00', TIMESTAMP '2026-09-16 15:35:00', 'ArkiTech CRM — require a work note to clock out, split logged time into client-billable and company work, snapshot the client rate onto each entry, and freeze entries once invoiced. One commit. Company time: our own product.'),
    (TIMESTAMP '2026-09-16 21:00:00', TIMESTAMP '2026-09-16 22:15:00', 'Elite Real Estate — robots.txt and a sitemap that reflects the pages that actually exist. One commit.'),
    (TIMESTAMP '2026-09-17 12:30:00', TIMESTAMP '2026-09-17 14:00:00', 'BibleTransfer123 — Northern Pashto support and an app shaped like the reference; Pashto selectable as a language with an arrow that says so; language hint pinned to the top of the page. Three commits.'),
    (TIMESTAMP '2026-09-17 14:15:00', TIMESTAMP '2026-09-17 15:00:00', 'Elite Real Estate — worked out the answer PrimeMLS wanted on the RESO Web API and what to ask alongside it. One commit; mostly reading their spec.'),
    (TIMESTAMP '2026-09-17 23:15:00', TIMESTAMP '2026-09-18 00:30:00', 'BibleTransfer123 — security pass: closed a code-execution hole and contained hostile card content. One commit; the rest was auditing the paths that could reach it.'),
    (TIMESTAMP '2026-09-18 00:45:00', TIMESTAMP '2026-09-18 01:45:00', 'Church CRM (Village Servers Directory) — expanded email discovery and enforced the strict directory filter so nothing unqualified reaches outreach. One commit.'),
    (TIMESTAMP '2026-09-18 08:00:00', TIMESTAMP '2026-09-18 08:45:00', 'BibleTransfer123 — sized the icons used inside a note''s heading. One commit.'),
    (TIMESTAMP '2026-09-18 20:30:00', TIMESTAMP '2026-09-18 22:15:00', 'Jeff''s Seafood — rebranded the site, added the content admin and the application form. One commit covering the rebrand.'),
    (TIMESTAMP '2026-09-19 11:45:00', TIMESTAMP '2026-09-19 13:00:00', 'Jeff''s Seafood — retargeted at Vercel, replacing D1 and R2 with a single JSON document store, and added a demo admin password carrying a visible reminder to replace it. Two commits.'),
    (TIMESTAMP '2026-09-19 13:05:00', TIMESTAMP '2026-09-19 13:50:00', 'BibleTransfer123 — Mandarin and Cantonese, imported from files already on disk. One commit.'),
    (TIMESTAMP '2026-09-19 16:00:00', TIMESTAMP '2026-09-19 18:00:00', 'Elite Real Estate — prepared PrimeMLS IDX with gated enquiries; fixed team agent IDs and the broker contact fallback; limited live search to RE/MAX North Professionals inventory; labelled lease listings and preserved the DNS rollback details. Four commits.'),
    (TIMESTAMP '2026-09-20 00:45:00', TIMESTAMP '2026-09-20 02:15:00', 'Elite Real Estate — sped up PrimeMLS listings with bounded warm caches. One commit; the rest was measuring where the time was going.')
) AS v(started, ended, summary);


-- ---------------------------------------------------------------------------
-- STEP 4 — check. Should be 15 rows totalling 20.75 hours.
-- ---------------------------------------------------------------------------
SELECT
  count(*) AS sessions,
  round(sum(EXTRACT(EPOCH FROM ("endedAt" - "startedAt")) / 3600)::numeric, 2) AS hours
FROM "OwnerWorkLog";
