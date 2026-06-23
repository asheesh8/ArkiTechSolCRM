"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, ChevronDown, PhoneCall, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [openStatus, setOpenStatus] = useState("NEW");
  const [statusLeads, setStatusLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((res) => res.json()).then(setStats);
  }, []);

  useEffect(() => {
    if (!openStatus) return;
    setLoadingLeads(true);
    fetch(`/api/leads?status=${openStatus}`)
      .then((res) => res.json())
      .then((data) => setStatusLeads(data.leads ?? []))
      .finally(() => setLoadingLeads(false));
  }, [openStatus]);

  const metrics = [
    { label: "Total leads", value: stats?.totalLeads, icon: Users },
    { label: "Calls today", value: stats?.callsMadeToday, icon: PhoneCall },
    { label: "Meetings booked", value: stats?.meetingsBooked, icon: CalendarCheck },
    { label: "Follow-ups due", value: stats?.followUpsDue, icon: Target },
    { label: "Close rate", value: stats ? `${stats.closeRate}%` : null, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-500">A live view of calls, meetings, and local-business pipeline health.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="overflow-hidden">
              <CardContent className="relative pt-5">
                <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)] opacity-80" />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500">{metric.label}</p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-900">
                    <Icon className="h-4 w-4 text-zinc-500" />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold">{metric.value ?? "..."}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Pipeline by Status</CardTitle>
              <p className="text-sm text-zinc-500">Click a status to open the live lead list.</p>
            </div>
            {openStatus ? <Badge value={openStatus} /> : null}
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
                  return (
                    <button
                      key={item.status}
                      type="button"
                      onClick={() => setOpenStatus(active ? "" : item.status)}
                      className={cn(
                        "rounded-lg border border-zinc-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950",
                        active && "border-[var(--accent)] ring-2 ring-[var(--accent)]/25",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Badge value={item.status} />
                        <span className="flex items-center gap-2 text-2xl font-semibold">
                          {item.count}
                          <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition", active && "rotate-180 text-[var(--accent)]")} />
                        </span>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-zinc-100 dark:bg-zinc-900">
                        <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(100, item.count * 24)}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {openStatus ? (
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
                    <div className="p-4">
                      <div className="h-28 animate-pulse rounded-md bg-white dark:bg-zinc-950" />
                    </div>
                  ) : statusLeads.length ? (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {statusLeads.slice(0, 6).map((lead) => (
                        <Link
                          key={lead.id}
                          href={`/clients/${lead.id}`}
                          className="grid gap-3 px-4 py-3 transition hover:bg-white dark:hover:bg-zinc-950 sm:grid-cols-[1fr_160px_120px]"
                        >
                          <div>
                            <p className="font-medium">{lead.businessName}</p>
                            <p className="mt-1 text-xs text-zinc-500">{lead.category ?? "Uncategorized"} · {[lead.city, lead.state].filter(Boolean).join(", ") || "No location"}</p>
                          </div>
                          <p className="text-sm text-zinc-500">{lead.phone ?? "No phone"}</p>
                          <p className="text-sm text-zinc-500">{lead.googleRating ?? "--"} rating</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-zinc-500">No leads in this status yet.</div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
