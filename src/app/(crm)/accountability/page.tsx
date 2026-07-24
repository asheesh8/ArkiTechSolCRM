import Link from "next/link";
import { CalendarCheck, CheckCircle2, ClipboardCheck, FileSignature, MessageSquarePlus, PhoneCall } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Accountability · LocalLead CRM" };

function dateLabel(value: Date | string | null | undefined) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700">
      {label}
    </div>
  );
}

function ActionRow({ href, title, meta, tone = "default" }: { href: string; title: string; meta: string; tone?: "default" | "danger" | "success" }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{meta}</p>
      </div>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone === "danger" ? "bg-red-500" : tone === "success" ? "bg-emerald-500" : "bg-[var(--accent)]"}`} />
    </Link>
  );
}

export default async function AccountabilityPage() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [followUps, meetings, contracts, dueWork] = await Promise.all([
    prisma.callNote.findMany({
      where: { followUpDate: { lte: nextWeek }, lead: { status: "FOLLOW_UP" } },
      include: { lead: { select: { id: true, businessName: true, phone: true, assignedTo: { select: { name: true } } } } },
      orderBy: { followUpDate: "asc" },
      take: 20,
    }),
    prisma.lead.findMany({
      where: { status: "MEETING_BOOKED" },
      select: { id: true, businessName: true, phone: true, city: true, state: true, assignedTo: { select: { name: true } }, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.contract.findMany({
      where: { status: "SENT" },
      include: { client: { select: { businessName: true, leadId: true } } },
      orderBy: { sentAt: "asc" },
      take: 20,
    }),
    prisma.workRequest.findMany({
      where: { dueDate: { lte: nextWeek }, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      include: { client: { select: { businessName: true, leadId: true } }, assignedDeveloper: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
  ]);

  const overdueFollowUps = followUps.filter((item) => item.followUpDate && item.followUpDate < todayStart).length;
  const overdueWork = dueWork.filter((item) => item.dueDate && item.dueDate < todayStart).length;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-[var(--accent)]">Accountability Agent</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Follow-ups, meetings, signatures, and due work</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">
          A daily command center for the things that can slip: sales callbacks, booked meetings, contracts waiting on signatures, and delivery commitments.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-5"><p className="text-xs font-medium uppercase text-zinc-400">Follow-ups</p><p className="mt-1 text-2xl font-semibold">{followUps.length}</p><p className="mt-1 text-xs text-red-500">{overdueFollowUps} overdue</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs font-medium uppercase text-zinc-400">Meetings</p><p className="mt-1 text-2xl font-semibold">{meetings.length}</p><p className="mt-1 text-xs text-zinc-500">Booked pipeline</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs font-medium uppercase text-zinc-400">Unsigned</p><p className="mt-1 text-2xl font-semibold">{contracts.length}</p><p className="mt-1 text-xs text-zinc-500">Contracts sent</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs font-medium uppercase text-zinc-400">Delivery Due</p><p className="mt-1 text-2xl font-semibold">{dueWork.length}</p><p className="mt-1 text-xs text-red-500">{overdueWork} overdue</p></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><div className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-zinc-500" /><CardTitle>Sales follow-ups</CardTitle></div></CardHeader>
          <CardContent className="space-y-2">
            {followUps.length ? followUps.map((item) => (
              <ActionRow key={item.id} href={`/clients/${item.lead.id}`} title={item.lead.businessName} meta={`${dateLabel(item.followUpDate)} · ${item.lead.assignedTo?.name ?? "Unassigned"} · ${item.lead.phone ?? "No phone"}`} tone={item.followUpDate && item.followUpDate < todayStart ? "danger" : "default"} />
            )) : <EmptyState label="No follow-ups due this week." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-zinc-500" /><CardTitle>Booked meetings</CardTitle></div></CardHeader>
          <CardContent className="space-y-2">
            {meetings.length ? meetings.map((item) => (
              <ActionRow key={item.id} href={`/clients/${item.id}`} title={item.businessName} meta={`${[item.city, item.state].filter(Boolean).join(", ") || "No location"} · ${item.assignedTo?.name ?? "Unassigned"}`} />
            )) : <EmptyState label="No meetings booked." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><FileSignature className="h-4 w-4 text-zinc-500" /><CardTitle>Contracts waiting</CardTitle></div></CardHeader>
          <CardContent className="space-y-2">
            {contracts.length ? contracts.map((item) => (
              <ActionRow key={item.id} href={item.client.leadId ? `/clients/${item.client.leadId}` : "/clients"} title={item.client.businessName} meta={`${item.planName} · sent ${dateLabel(item.sentAt)}`} />
            )) : <EmptyState label="No contracts waiting on client signature." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><MessageSquarePlus className="h-4 w-4 text-zinc-500" /><CardTitle>Delivery due</CardTitle></div></CardHeader>
          <CardContent className="space-y-2">
            {dueWork.length ? dueWork.map((item) => (
              <ActionRow key={item.id} href="/requests" title={item.title} meta={`${item.client.businessName} · due ${dateLabel(item.dueDate)} · ${item.assignedDeveloper?.name ?? "Unassigned"}`} tone={item.dueDate && item.dueDate < todayStart ? "danger" : "default"} />
            )) : <EmptyState label="No delivery deadlines due this week." />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><div className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-zinc-500" /><CardTitle>Daily operating rhythm</CardTitle></div></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            ["Morning", "Clear overdue follow-ups, assign unowned work, confirm today's meetings."],
            ["Midday", "Update delivery statuses, log hours, attach GitHub repos, and push blockers into staff notes."],
            ["End of day", "Review unsigned contracts and due work, then schedule tomorrow's follow-ups."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><Badge value={title} /></div>
              <p className="text-sm leading-6 text-zinc-500">{copy}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
