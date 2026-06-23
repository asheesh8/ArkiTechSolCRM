"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CheckCircle2, PhoneCall, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((res) => res.json()).then(setStats);
  }, []);

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
            <Card key={metric.label}>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500">{metric.label}</p>
                  <Icon className="h-4 w-4 text-zinc-400" />
                </div>
                <p className="mt-4 text-3xl font-semibold">{metric.value ?? "..."}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats ? (
            <div className="h-48 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {stats.pipeline.map((item: any) => (
                <div key={item.status} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <Badge value={item.status} />
                    <span className="text-2xl font-semibold">{item.count}</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <div className="h-2 rounded-full bg-zinc-950 dark:bg-white" style={{ width: `${Math.min(100, item.count * 24)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
