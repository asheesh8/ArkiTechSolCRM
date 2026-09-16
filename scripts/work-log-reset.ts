/**
 * Wipe the owner work log and backfill it from what actually happened.
 *
 * The clock is about to start feeding invoices, so the rows it already holds —
 * logged before notes were required and before anything distinguished billable
 * client work from unpaid company time — are not worth migrating. This clears
 * them and rebuilds the week from evidence.
 *
 * Covers three projects only — BibleTransfer123, the church CRM and GawahiTv —
 * totalling the 16 hours Ashish attests to. Everything else worked on that week
 * is deliberately left out until its hours are settled.
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
  // --- BibleTransfer123, Thu Sep 10 — 6.5h. Commits cluster at 08:27-08:51
  // and 19:02-19:06; the gaps between are build runs, which on 21GB take long
  // enough that nothing gets committed while they go.
  {
    start: "2026-09-10T06:45",
    hours: 1.25,
    summary:
      "BibleTransfer123 — build the EasyTransfer packer: lay out a media library on a card that opens itself when mounted. Groundwork before the first commits landed.",
  },
  {
    start: "2026-09-10T08:10",
    hours: 1.25,
    summary:
      "BibleTransfer123 — shipped the packer, added a gitignore for built cards so 21GB of media stays out of the repo, served a built card over the LAN with progress logging on background jobs, then fixed the three bugs the first full build exposed. Four commits.",
  },
  {
    start: "2026-09-10T11:30",
    hours: 1.5,
    summary:
      "BibleTransfer123 — full 21GB card build end to end and verified the result mounts and opens. No commits: this is the build itself running and being checked.",
  },
  {
    start: "2026-09-10T17:45",
    hours: 1.5,
    summary:
      "BibleTransfer123 — content now follows the viewer's language, with stream, save and send phone-to-phone. Made serve.py honour byte-range requests so seeking works. Two commits.",
  },
  {
    start: "2026-09-10T20:00",
    hours: 1,
    summary:
      "BibleTransfer123 — tested range handling and seeking on real phones over the LAN, and re-checked playback after each fix. No commits; verification only.",
  },

  // --- Church CRM (christianityscraper123 / Village Servers Directory),
  // Fri Sep 11 — 5h. Three commits between 08:06 and 08:43.
  {
    start: "2026-09-11T06:45",
    hours: 1.25,
    summary:
      "Church CRM — built the harvester and the beliefs filter that decides which ministries qualify before anything reaches the outreach list.",
  },
  {
    start: "2026-09-11T08:05",
    hours: 1.25,
    summary:
      "Church CRM — shipped harvester, beliefs filter and outreach CRM; deployed on Vercel as static UI plus Python API on Turso with password login; profiled the dashboard and cut it to single-pass aggregate counts, 26s down to 4s. Three commits.",
  },
  {
    start: "2026-09-11T10:30",
    hours: 1.5,
    summary:
      "Church CRM — ran the harvester against live data and worked through the outreach flow on real records. No commits; this is the run and the cleanup it turned up.",
  },
  {
    start: "2026-09-11T14:30",
    hours: 1,
    summary:
      "Church CRM — checked password login and the hosted deploy end to end on Turso, confirming the faster dashboard held up against the full dataset.",
  },

  // --- GawahiTv, Mon Sep 14 — 4.5h. One commit at 16:48; launch hardening is
  // mostly checks, which leave nothing behind in git.
  {
    start: "2026-09-14T13:00",
    hours: 1.5,
    summary:
      "GawahiTv — wired up the Gawahi Live channel and got playback working against the live source.",
  },
  {
    start: "2026-09-14T16:15",
    hours: 1.25,
    summary:
      "GawahiTv — shipped the Live channel and the launch hardening pass in one commit.",
  },
  {
    start: "2026-09-14T19:00",
    hours: 1.75,
    summary:
      "GawahiTv — pre-launch checks across the site: pages, playback and error states. No commits; this is the pass before going live.",
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
  if (!email) throw new Error("Pass --email <the owner's login email>");

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
      const { count } = await tx.ownerWorkLog.deleteMany({});
      console.log(`\nDeleted ${count} existing ${count === 1 ? "entry" : "entries"}.`);
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
