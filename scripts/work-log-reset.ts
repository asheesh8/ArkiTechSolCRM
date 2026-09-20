/**
 * Wipe the owner work log and backfill it from what actually happened.
 *
 * The clock is about to start feeding invoices, so the rows it already holds —
 * logged before notes were required and before anything distinguished billable
 * client work from unpaid company time — are not worth migrating. This clears
 * them and rebuilds the week from evidence.
 *
 * Covers every ArkiTech repo touched between Sat Sep 12 and Sat Sep 19: Elite
 * Real Estate, BibleTransfer123, Jeff's Seafood, GawahiTv, the church CRM and
 * the CRM itself — 27 commits in all.
 *
 * Session times are anchored to real commits, converted from the UTC that git
 * stores into America/New_York, which is what the clock displays. Get that
 * conversion wrong and Thursday morning's work lands on Wednesday night.
 *
 * Split the way the work actually happened — short sessions across a day, not
 * one unbroken block. Commits land inside the sessions that shipped them; the
 * sessions between are build runs, profiling and device testing, which leave
 * nothing behind in git. Each summary says which is which, so any block can be
 * explained line by line if a client ever asks.
 *
 * Nothing is written without --apply. Run it as:
 *
 *   DATABASE_URL="..." pnpm dlx tsx scripts/work-log-reset.ts --email you@example.com
 *   DATABASE_URL="..." pnpm dlx tsx scripts/work-log-reset.ts --email you@example.com --wipe --apply
 */
import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Session = {
  /** Local wall-clock start, America/New_York. */
  start: string;
  /** Hours worked, to the quarter hour. */
  hours: number;
  summary: string;
  /**
   * Which client this bills to, by `Client.businessName`. Leave undefined and
   * the session is logged as company time: visible, but charged to nobody.
   * Anything named here must already exist and already have an hourlyRate, or
   * the script stops rather than guess what the hour was worth.
   */
  client?: string;
};

// EDT is UTC-4 in September. Written out rather than inferred so a machine in
// another timezone running this produces the same rows.
const OFFSET = "-04:00";

const SESSIONS: Session[] = [
  // --- Sat Sep 12 — Elite, three commits 22:46-23:06.
  {
    start: "2026-09-12T21:30",
    hours: 2,
    summary:
      "Elite Real Estate — finished the other tool's pass and restored what it had removed, wrote one roadmap covering everything left including Phase 2, and rewrote 'Elite by the Numbers' in Darcy's own wording. Three commits.",
  },

  // --- Mon Sep 14 — GawahiTv, one commit at 16:48.
  {
    start: "2026-09-14T15:30",
    hours: 2,
    summary:
      "GawahiTv — added the Gawahi Live channel and hardened the site for launch. One commit; the rest of the block was pre-launch checks across pages, playback and error states.",
  },

  // --- Wed Sep 16 — Elite branding sprint (5 commits 09:44-10:08), the CRM
  // work log change, then Elite SEO in the evening.
  {
    start: "2026-09-16T08:30",
    hours: 2,
    summary:
      "Elite Real Estate — Darcy's logo everywhere and dropped the single-office framing; put Darcy first with Brandon beside her; her bio verbatim including 'equal partner'; copy fixes from her review; published the 5.0 from 92 reviews Google rating. Five commits off the back of Darcy's review.",
  },
  {
    start: "2026-09-16T10:35",
    hours: 1,
    summary:
      "ArkiTech CRM — require a work note to clock out, split logged time into client-billable and company work, snapshot the client rate onto each entry, and freeze entries once invoiced. One commit. Company time: our own product.",
  },
  {
    start: "2026-09-16T17:00",
    hours: 1.25,
    summary:
      "Elite Real Estate — robots.txt and a sitemap that reflects the pages that actually exist. One commit.",
  },

  // --- Thu Sep 17 — Pashto work on BibleTransfer, PrimeMLS research for
  // Elite, then a security pass and the directory filters at night.
  {
    start: "2026-09-17T08:30",
    hours: 1.5,
    summary:
      "BibleTransfer123 — Northern Pashto support and an app shaped like the reference; Pashto selectable as a language with an arrow that says so; language hint pinned to the top of the page. Three commits.",
  },
  {
    start: "2026-09-17T10:15",
    hours: 0.75,
    summary:
      "Elite Real Estate — worked out the answer PrimeMLS wanted on the RESO Web API and what to ask alongside it. One commit; mostly reading their spec.",
  },
  {
    start: "2026-09-17T19:15",
    hours: 1.25,
    summary:
      "BibleTransfer123 — security pass: closed a code-execution hole and contained hostile card content. One commit; the rest was auditing the paths that could reach it.",
  },
  {
    start: "2026-09-17T20:45",
    hours: 1,
    summary:
      "Church CRM (Village Servers Directory) — expanded email discovery and enforced the strict directory filter so nothing unqualified reaches outreach. One commit.",
  },

  // --- Fri Sep 18 — a small fix early, then the Jeff's Seafood rebrand.
  {
    start: "2026-09-18T04:00",
    hours: 0.75,
    summary: "BibleTransfer123 — sized the icons used inside a note's heading. One commit.",
  },
  {
    start: "2026-09-18T16:30",
    hours: 1.75,
    summary:
      "Jeff's Seafood — rebranded the site, added the content admin and the application form. One commit covering the rebrand.",
  },

  // --- Sat Sep 19 — Jeff's Seafood onto Vercel, more languages, then the
  // PrimeMLS IDX push for Elite (4 commits 12:43-13:33) and caching at night.
  {
    start: "2026-09-19T07:45",
    hours: 1.25,
    summary:
      "Jeff's Seafood — retargeted at Vercel, replacing D1 and R2 with a single JSON document store, and added a demo admin password carrying a visible reminder to replace it. Two commits.",
  },
  {
    start: "2026-09-19T09:05",
    hours: 0.75,
    summary: "BibleTransfer123 — Mandarin and Cantonese, imported from files already on disk. One commit.",
  },
  {
    start: "2026-09-19T12:00",
    hours: 2,
    summary:
      "Elite Real Estate — prepared PrimeMLS IDX with gated enquiries; fixed team agent IDs and the broker contact fallback; limited live search to RE/MAX North Professionals inventory; labelled lease listings and preserved the DNS rollback details. Four commits.",
  },
  {
    start: "2026-09-19T20:45",
    hours: 1.5,
    summary:
      "Elite Real Estate — sped up PrimeMLS listings with bounded warm caches. One commit; the rest was measuring where the time was going.",
  },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const emailIndex = args.indexOf("--email");
  return {
    email: emailIndex >= 0 ? args[emailIndex + 1] : "",
    wipe: args.includes("--wipe"),
    apply: args.includes("--apply"),
  };
}

function rangeFor(session: Session) {
  const startedAt = new Date(`${session.start}:00${OFFSET}`);
  const endedAt = new Date(startedAt.getTime() + session.hours * 3_600 * 1_000);
  return { startedAt, endedAt };
}

function show(value: Date) {
  return value.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function main() {
  const { email, wipe, apply } = parseArgs();

  if (!email) {
    const owners = await prisma.user.findMany({
      where: { role: "OWNER" },
      select: { name: true, email: true },
      orderBy: { name: "asc" },
    });
    console.log("\nPass --email with one of these owners:\n");
    for (const owner of owners) console.log(`  ${owner.name.padEnd(12)} ${owner.email}`);
    console.log("");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, role: true } });
  if (!user) throw new Error(`No user with email ${email}`);
  if (user.role !== "OWNER") throw new Error(`${email} is ${user.role}, not OWNER`);

  // Resolve every named client up front. Failing here beats writing half a
  // week of hours and then discovering the eighth one has no rate.
  const named = [...new Set(SESSIONS.map((s) => s.client).filter(Boolean))] as string[];
  const clients = new Map<string, { id: string; hourlyRate: number | null }>();
  for (const businessName of named) {
    const client = await prisma.client.findFirst({
      where: { businessName },
      select: { id: true, businessName: true, hourlyRate: true },
    });
    if (!client) throw new Error(`No client named "${businessName}"`);
    if (!client.hourlyRate) throw new Error(`Client "${businessName}" has no hourlyRate set`);
    clients.set(businessName, { id: client.id, hourlyRate: client.hourlyRate });
  }

  const existing = await prisma.ownerWorkLog.count();
  const totalHours = SESSIONS.reduce((sum, s) => sum + s.hours, 0);

  console.log(`\nUser:     ${user.name} <${email}>`);
  console.log(`Existing: ${existing} work log ${existing === 1 ? "entry" : "entries"}${wipe ? " — will be deleted" : " — left alone (pass --wipe)"}`);
  console.log(`Backfill: ${SESSIONS.length} sessions, ${totalHours} hours\n`);

  for (const session of SESSIONS) {
    const { startedAt, endedAt } = rangeFor(session);
    const billed = session.client ? `${session.client} @ $${clients.get(session.client)!.hourlyRate}/hr` : "company time";
    console.log(`  ${show(startedAt)} → ${show(endedAt)}  ${String(session.hours).padStart(4)}h  ${billed}`);
  }

  if (!apply) {
    console.log("\nDry run. Nothing written. Add --apply to commit these rows.\n");
    return;
  }

  await prisma.$transaction(async (tx) => {
    if (wipe) {
      const doomed = await tx.ownerWorkLog.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { startedAt: "asc" },
      });
      const backup = `work-log-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      writeFileSync(backup, JSON.stringify(doomed, null, 2));
      console.log(`\nBacked up ${doomed.length} ${doomed.length === 1 ? "entry" : "entries"} to ${backup}`);

      const { count } = await tx.ownerWorkLog.deleteMany({});
      console.log(`Deleted ${count} existing ${count === 1 ? "entry" : "entries"}.`);
    }

    for (const session of SESSIONS) {
      const { startedAt, endedAt } = rangeFor(session);
      const client = session.client ? clients.get(session.client)! : null;
      await tx.ownerWorkLog.create({
        data: {
          userId: user.id,
          startedAt,
          endedAt,
          workSummary: session.summary,
          kind: client ? "CLIENT_BILLABLE" : "COMPANY",
          clientId: client?.id ?? null,
          hourlyRate: client?.hourlyRate ?? null,
        },
      });
    }
  });

  console.log(`Wrote ${SESSIONS.length} sessions totalling ${totalHours} hours.\n`);
}

main()
  .catch((error) => {
    console.error(`\n${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
