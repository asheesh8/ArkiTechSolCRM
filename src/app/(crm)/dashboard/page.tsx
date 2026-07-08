"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CalendarCheck, CheckCircle2, ChevronDown, Clock, CreditCard, FileSignature, Inbox, MessageSquarePlus, PhoneCall, Trash2, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusDetails: Record<string, { description: string; next: string }> = {
  NEW: { description: "Fresh prospects from search that still need a first touch.", next: "Qualify and save the best fits." },
  SAVED: { description: "Businesses worth working that have been added to the CRM.", next: "Assign an owner and start outreach." },
  CALLED: { description: "Contacts you have already dialed at least once.", next: "Log the result and decide follow-up." },
  MEETING_BOOKED: { description: "Prospects with a scheduled discovery or sales call.", next: "Prepare audit notes before the meeting." },
  NOT_INTERESTED: { description: "People who said no or are not a fit right now.", next: "Keep out of active calling." },
  FOLLOW_UP: { description: "Warm leads that need another touch on a specific date.", next: "Call or email before they cool off." },
  CLOSED: { description: "Converted clients or completed opportunities.", next: "Track delivery and referrals." },
};

type Notif = {
  workRequests: any[];
  overdueInvoices: any[];
  upcomingInvoices: any[];
  unsignedContracts: any[];
  followUps: any[];
  meetings: any[];
};

function Section({ icon: Icon, title, color, count, children }: { icon: any; title: string; color: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${color}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
        <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NotifRow({ href, primary, secondary, tag, tagColor }: { href: string; primary: string; secondary: string; tag?: string; tagColor?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{primary}</p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{secondary}</p>
      </div>
      {tag && <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${tagColor}`}>{tag}</span>}
      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-700 dark:group-hover:text-zinc-400" />
    </Link>
  );
}

export default function DashboardPage() {
  const [notifs, setNotifs] = useState<Notif | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [team, setTeam] = useState<any[] | null>(null);
  const [openStatus, setOpenStatus] = useState("");
  const [statusLeads, setStatusLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats);
    fetch("/api/dashboard/notifications").then((r) => r.json()).then(setNotifs);
    fetch("/api/dashboard/assignments").then((r) => r.json()).then((d) => setTeam(d.team ?? [])).catch(() => setTeam([]));
  }, []);

  useEffect(() => {
    if (!openStatus) return;
    setLoadingLeads(true);
    fetch(`/api/leads?status=${openStatus}`)
      .then((r) => r.json())
      .then((d) => setStatusLeads(d.leads ?? []))
      .finally(() => setLoadingLeads(false));
  }, [openStatus]);

  async function deleteLead(id: string) {
    const lead = statusLeads.find((l) => l.id === id);
    if (!window.confirm(`Delete ${lead?.businessName ?? "this lead"}?`)) return;
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setStatusLeads((prev) => prev.filter((l) => l.id !== id));
  }

  const totalActions = notifs
    ? notifs.workRequests.length + notifs.overdueInvoices.length + notifs.unsignedContracts.length + notifs.followUps.length
    : 0;

  return (
    <div className="space-y-8">

      {/* ── Header row ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="mt-1 text-sm text-zinc-500">Your action items and pipeline at a glance.</p>
        </div>
        <Link href="/clients">
          <Button><UserPlus className="h-4 w-4" /> Onboard client</Button>
        </Link>
      </div>

      {/* ── Notifications / Todo ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="self-start">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-zinc-500" />
              <CardTitle>Action needed</CardTitle>
              {totalActions > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{totalActions}</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!notifs ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />)}
              </div>
            ) : totalActions === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <p className="font-medium text-zinc-700 dark:text-zinc-300">All clear!</p>
                <p className="text-sm text-zinc-400">No pending action items right now.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <Section icon={MessageSquarePlus} title="Client work requests" color="bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" count={notifs.workRequests.length}>
                  {notifs.workRequests.map((r: any) => (
                    <NotifRow
                      key={r.id}
                      href={`/requests`}
                      primary={r.title}
                      secondary={`${r.client.businessName} · ${new Date(r.createdAt).toLocaleDateString()}`}
                      tag={r.status === "OPEN" ? "New" : "In progress"}
                      tagColor={r.status === "OPEN" ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"}
                    />
                  ))}
                </Section>

                <Section icon={AlertCircle} title="Overdue invoices" color="bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" count={notifs.overdueInvoices.length}>
                  {notifs.overdueInvoices.map((inv: any) => (
                    <NotifRow
                      key={inv.id}
                      href={inv.client.leadId ? `/clients/${inv.client.leadId}` : `/clients`}
                      primary={`$${inv.amount.toFixed(2)} overdue`}
                      secondary={`${inv.client.businessName} · due ${new Date(inv.dueDate).toLocaleDateString()}`}
                      tag="Overdue"
                      tagColor="bg-red-100 text-red-700"
                    />
                  ))}
                </Section>

                <Section icon={FileSignature} title="Awaiting signature" color="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" count={notifs.unsignedContracts.length}>
                  {notifs.unsignedContracts.map((c: any) => (
                    <NotifRow
                      key={c.id}
                      href={c.client.leadId ? `/clients/${c.client.leadId}/onboard` : `/clients`}
                      primary={`${c.client.businessName} — ${c.planName}`}
                      secondary={`Sent ${c.sentAt ? new Date(c.sentAt).toLocaleDateString() : "—"} · $${c.total.toFixed(2)}/${c.billingCycle.toLowerCase()}`}
                      tag="Pending"
                      tagColor="bg-amber-100 text-amber-700"
                    />
                  ))}
                </Section>

                <Section icon={PhoneCall} title="Follow-ups due" color="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" count={notifs.followUps.length}>
                  {notifs.followUps.map((f: any) => (
                    <NotifRow
                      key={f.id}
                      href={`/clients/${f.lead.id}`}
                      primary={f.lead.businessName}
                      secondary={`Follow up ${new Date(f.followUpDate).toLocaleDateString()} · ${f.lead.phone ?? "No phone"}`}
                      tag={new Date(f.followUpDate) < new Date() ? "Overdue" : "Today"}
                      tagColor={new Date(f.followUpDate) < new Date() ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}
                    />
                  ))}
                </Section>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Right column: upcoming + meetings ── */}
        <div className="space-y-4">
          {/* Upcoming invoices */}
          {notifs && notifs.upcomingInvoices.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-zinc-500" />
                  <CardTitle className="text-base">Payments due this week</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifs.upcomingInvoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{inv.client.businessName}</p>
                      <p className="text-xs text-zinc-500">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className="ml-3 shrink-0 font-semibold text-zinc-900 dark:text-zinc-100">${inv.amount.toFixed(2)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Meetings booked */}
          {notifs && notifs.meetings.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-zinc-500" />
                  <CardTitle className="text-base">Meetings booked</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifs.meetings.map((m: any) => (
                  <Link key={m.id} href={`/clients/${m.id}`} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition">
                    <div>
                      <p className="font-medium">{m.businessName}</p>
                      <p className="text-xs text-zinc-500">{[m.city, m.state].filter(Boolean).join(", ") || "No location"}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick tip */}
          <div className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">Pipeline focus</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">Prioritize low-review, high-rating businesses with weak or missing websites.</p>
          </div>
        </div>
      </div>

      {/* ── Team call progress ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              <div>
                <CardTitle>Team call progress</CardTitle>
                <p className="text-sm text-zinc-500">Who&apos;s assigned what, and how many they&apos;ve worked through this week.</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!team ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />)}
            </div>
          ) : team.filter((m) => m.assigned > 0 || m.callsThisWeek > 0).length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-zinc-400">
              <Users className="h-8 w-8 opacity-30" />
              <p className="text-sm">No leads assigned yet.</p>
              <p className="text-xs">Assign leads to teammates from the CRM or a lead&apos;s page to track their calling.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {team.filter((m) => m.assigned > 0 || m.callsThisWeek > 0).map((m) => (
                <div key={m.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--accent-foreground)]">
                        {m.name.split(/\s+/).slice(0, 2).map((p: string) => p[0]).join("").toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{m.name}</p>
                        <p className="text-[11px] uppercase tracking-wide text-zinc-400">{m.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-zinc-500"><PhoneCall className="h-3.5 w-3.5" />{m.callsThisWeek} this week</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{m.contacted}/{m.assigned} done</span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <div
                      className={cn("h-2 rounded-full transition-all", m.remaining === 0 ? "bg-emerald-500" : "bg-[var(--accent)]")}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    {m.remaining === 0
                      ? m.assigned > 0 ? "All assigned leads have been called — nice work." : "No leads assigned."
                      : `${m.remaining} still to call.`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Pipeline by status ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Pipeline by status</CardTitle>
              <p className="text-sm text-zinc-500">Click a stage to see the leads sitting there.</p>
            </div>
            {openStatus && <Badge value={openStatus} />}
          </div>
        </CardHeader>
        <CardContent>
          {!stats ? (
            <div className="h-48 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
          ) : (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {stats.pipeline.map((item: any) => {
                  const active = openStatus === item.status;
                  const detail = statusDetails[item.status];
                  return (
                    <button
                      key={item.status}
                      type="button"
                      onClick={() => setOpenStatus(active ? "" : item.status)}
                      className={cn(
                        "rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950",
                        active && "border-[var(--accent)] bg-zinc-50 ring-2 ring-[var(--accent)]/25 dark:bg-zinc-900/60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Badge value={item.status} />
                        <span className="flex items-center gap-2 text-2xl font-semibold">
                          {item.count}
                          <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition", active && "rotate-180 text-[var(--accent)]")} />
                        </span>
                      </div>
                      <div className="mt-4 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900">
                        <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(100, item.count * 24)}%` }} />
                      </div>
                      <p className="mt-3 min-h-10 text-xs leading-5 text-zinc-500">{detail?.description}</p>
                      <p className="mt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">{detail?.next}</p>
                    </button>
                  );
                })}
              </div>

              {openStatus && (
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                    <div>
                      <p className="font-medium">Leads in this stage</p>
                      <p className="text-xs text-zinc-500">{statusLeads.length} businesses currently marked here</p>
                    </div>
                    <Link href={`/clients?status=${openStatus}`}>
                      <Button variant="outline" size="sm">Open CRM</Button>
                    </Link>
                  </div>
                  {loadingLeads ? (
                    <div className="p-4"><div className="h-28 animate-pulse rounded-md bg-white dark:bg-zinc-950" /></div>
                  ) : statusLeads.length ? (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {statusLeads.slice(0, 6).map((lead) => (
                        <div key={lead.id} className="grid gap-3 px-4 py-3 transition hover:bg-white dark:hover:bg-zinc-950 sm:grid-cols-[1fr_150px_100px_172px] sm:items-center">
                          <div>
                            <p className="font-medium">{lead.businessName}</p>
                            <p className="mt-1 text-xs text-zinc-500">{lead.category ?? "Uncategorized"} · {[lead.city, lead.state].filter(Boolean).join(", ") || "No location"}</p>
                          </div>
                          <p className="text-sm text-zinc-500">{lead.phone ?? "No phone"}</p>
                          <p className="text-sm text-zinc-500">{lead.googleRating ?? "--"} rating</p>
                          <div className="flex gap-2 sm:justify-end">
                            <Link href={`/clients/${lead.id}`}><Button variant="outline" size="sm">View</Button></Link>
                            <Button variant="danger" size="sm" onClick={() => deleteLead(lead.id)}>
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-zinc-500">No leads in this status yet.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Clock widget ── */}
      {notifs && notifs.upcomingInvoices.length === 0 && notifs.meetings.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">
          <Clock className="h-4 w-4 shrink-0" />
          No upcoming payments or meetings in the next 7 days.
        </div>
      )}
    </div>
  );
}
