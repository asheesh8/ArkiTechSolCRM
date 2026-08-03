"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, Clock3, FileCheck2, Loader2, NotebookPen, RefreshCw, TimerReset, UsersRound } from "lucide-react";
import { OwnerTimeClock } from "@/components/crm/owner-time-clock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WorkLogUser = {
  id: string;
  name: string;
  email: string;
};

type WorkLogEntry = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  workSummary: string;
  durationSeconds: number;
  user: WorkLogUser;
};

type OwnerInsightBreakdown = {
  name: string;
  email: string;
  seconds: number;
  sessions: number;
  documentedSessions: number;
};

type DayInsight = {
  key: string;
  label: string;
  seconds: number;
  percent: number;
};

type WorkLogInsights = {
  todaySeconds: number;
  weekSeconds: number;
  monthSeconds: number;
  averageSessionSeconds: number;
  documentedPercent: number;
  completedPercent: number;
  productivityScore: number;
  productivityLabel: string;
  streakDays: number;
  sessionCount: number;
  completedCount: number;
  ownerBreakdown: OwnerInsightBreakdown[];
  last7Days: DayInsight[];
};

type WorkLogResponse = {
  viewerId: string;
  activeEntry: WorkLogEntry | null;
  recentEntries: WorkLogEntry[];
  calendarEntries?: WorkLogEntry[];
  insights: WorkLogInsights;
};

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${remainingSeconds}s`;
}

function entrySeconds(entry: WorkLogEntry, now: number) {
  if (entry.endedAt) return entry.durationSeconds;
  return Math.max(0, Math.round((now - new Date(entry.startedAt).getTime()) / 1000));
}

function formatEntryRange(entry: WorkLogEntry) {
  const start = new Date(entry.startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (!entry.endedAt) return `${start} - Live`;
  const end = new Date(entry.endedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${start} - ${end}`;
}

function firstName(name: string) {
  return name.split(/\s+/).filter(Boolean)[0] ?? name;
}

function ownerColor(value: string) {
  const colors = [
    "border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100",
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
  ];
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return colors[hash % colors.length];
}

function SummaryTile({ icon: Icon, label, value, detail }: { icon: ComponentType<{ className?: string }>; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 truncate text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

export function OwnerTimeCalendar() {
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [data, setData] = useState<WorkLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(() => Date.now());

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(anchor, index)), [anchor]);
  const rangeEnd = useMemo(() => addDays(anchor, 7), [anchor]);
  const rangeLabel = `${days[0].toLocaleDateString([], { month: "short", day: "numeric" })} - ${days[6].toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const timeMin = anchor.toISOString();
    const timeMax = rangeEnd.toISOString();
    try {
      const response = await fetch(`/api/owner/work-log?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`, { cache: "no-store" });
      const nextData = await response.json().catch(() => null);
      if (!response.ok) throw new Error(nextData?.error ?? "Could not load owner time");
      setData(nextData as WorkLogResponse);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Could not load owner time");
    } finally {
      setLoading(false);
    }
  }, [anchor, rangeEnd]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const entries = useMemo(() => data?.calendarEntries ?? [], [data?.calendarEntries]);
  const liveEntryId = data?.activeEntry?.id ?? entries.find((entry) => !entry.endedAt)?.id ?? "";

  useEffect(() => {
    if (!liveEntryId) return;
    setTick(Date.now());
    const timer = window.setInterval(() => setTick(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [liveEntryId]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, WorkLogEntry[]>();
    for (const day of days) map.set(day.toDateString(), []);

    for (const entry of entries) {
      const startedAt = new Date(entry.startedAt);
      const key = startedAt < anchor ? anchor.toDateString() : startedAt.toDateString();
      if (map.has(key)) map.get(key)!.push(entry);
    }

    return map;
  }, [anchor, days, entries]);

  const dayTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const day of days) {
      const key = day.toDateString();
      const total = (entriesByDay.get(key) ?? []).reduce((sum, entry) => sum + entrySeconds(entry, tick), 0);
      map.set(key, total);
    }
    return map;
  }, [days, entriesByDay, tick]);

  const weekSeconds = useMemo(() => Array.from(dayTotals.values()).reduce((sum, seconds) => sum + seconds, 0), [dayTotals]);
  const selectedEntries = entriesByDay.get(selectedDay.toDateString()) ?? [];
  const selectedSeconds = selectedEntries.reduce((sum, entry) => sum + entrySeconds(entry, tick), 0);
  const documentedPercent = entries.length ? Math.round((entries.filter((entry) => entry.workSummary.trim()).length / entries.length) * 100) : 0;
  const maxDaySeconds = Math.max(1, ...Array.from(dayTotals.values()));

  const ownerTotals = useMemo(() => {
    const totals = new Map<string, { user: WorkLogUser; seconds: number; sessions: number }>();
    for (const entry of entries) {
      const existing = totals.get(entry.user.id) ?? { user: entry.user, seconds: 0, sessions: 0 };
      existing.seconds += entrySeconds(entry, tick);
      existing.sessions += 1;
      totals.set(entry.user.id, existing);
    }
    return Array.from(totals.values()).sort((a, b) => b.seconds - a.seconds);
  }, [entries, tick]);

  const maxOwnerSeconds = Math.max(1, ...ownerTotals.map((owner) => owner.seconds));
  const today = new Date();

  function moveWeek(daysToAdd: number) {
    const nextAnchor = addDays(anchor, daysToAdd);
    setAnchor(nextAnchor);
    setSelectedDay(nextAnchor);
  }

  function jumpToday() {
    const now = new Date();
    setAnchor(startOfWeek(now));
    setSelectedDay(now);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Owner time</h2>
          <p className="mt-1 text-sm text-zinc-500">Ashish and Terri clock-ins by workday.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => moveWeek(-7)}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button variant="secondary" size="sm" onClick={jumpToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => moveWeek(7)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Refresh owner time" onClick={() => void loadEntries()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </section>

      {error && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Owner time unavailable</p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <SummaryTile icon={Clock3} label="Visible week" value={formatDuration(weekSeconds)} detail={`${entries.length} session${entries.length === 1 ? "" : "s"}`} />
            <SummaryTile icon={CalendarDays} label="Selected day" value={formatDuration(selectedSeconds)} detail={selectedDay.toLocaleDateString([], { weekday: "long" })} />
            <SummaryTile icon={FileCheck2} label="Documented" value={`${documentedPercent}%`} detail="Sessions with notes" />
            <SummaryTile icon={BarChart3} label="Today" value={formatDuration(data?.insights.todaySeconds ?? 0)} detail={data?.insights.productivityLabel ?? "Current day"} />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div className="min-w-0">
                <CardTitle>{rangeLabel}</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">Owner work log calendar</p>
              </div>
              <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                {formatDuration(weekSeconds)}
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-7">
                {days.map((day) => {
                  const key = day.toDateString();
                  const dayEntries = entriesByDay.get(key) ?? [];
                  const active = sameDay(day, selectedDay);
                  const isToday = sameDay(day, today);
                  const totalSeconds = dayTotals.get(key) ?? 0;
                  const percent = Math.round((totalSeconds / maxDaySeconds) * 100);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      aria-pressed={active}
                      className={cn(
                        "flex min-h-40 flex-col rounded-lg border border-zinc-200 bg-white p-3 text-left transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60 lg:min-h-64",
                        active && "border-[var(--accent)] ring-1 ring-[var(--accent)]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase text-zinc-400">{day.toLocaleDateString([], { weekday: "short" })}</p>
                          <p className={cn("mt-0.5 text-lg font-semibold", isToday && "text-[var(--accent)]")}>{day.getDate()}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                          {formatDuration(totalSeconds)}
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                        <div
                          className={cn("h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--brand-emerald))]", totalSeconds === 0 && "bg-zinc-300 dark:bg-zinc-800")}
                          style={{ width: totalSeconds ? `${Math.max(8, percent)}%` : "8%" }}
                        />
                      </div>

                      <div className="mt-3 flex-1 space-y-2">
                        {loading ? (
                          <div className="space-y-2">
                            <div className="h-8 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                            <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                          </div>
                        ) : dayEntries.length ? (
                          dayEntries.slice(0, 4).map((entry) => (
                            <div key={entry.id} className={cn("rounded-md border px-2 py-1.5 text-xs", ownerColor(entry.user.email))}>
                              <div className="flex items-center justify-between gap-2 font-semibold">
                                <span className="truncate">{formatEntryRange(entry)}</span>
                                <span className="shrink-0 tabular-nums">{entry.endedAt ? formatDuration(entrySeconds(entry, tick)) : "Live"}</span>
                              </div>
                              <p className="mt-0.5 truncate font-medium opacity-90">{firstName(entry.user.name)}</p>
                              <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 opacity-75">{entry.workSummary || "No note added."}</p>
                            </div>
                          ))
                        ) : (
                          <p className="pt-8 text-center text-xs text-zinc-400">No owner time</p>
                        )}
                        {dayEntries.length > 4 && <p className="text-xs text-zinc-400">+{dayEntries.length - 4} more</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div className="min-w-0">
                <CardTitle>{selectedDay.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">{formatDuration(selectedSeconds)} logged</p>
              </div>
              <NotebookPen className="h-4 w-4 shrink-0 text-zinc-400" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => <div key={index} className="h-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />)}
                </div>
              ) : selectedEntries.length ? (
                <div className="space-y-3">
                  {selectedEntries.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{entry.user.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">{formatEntryRange(entry)}</p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                            entry.endedAt
                              ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                          )}
                        >
                          {entry.endedAt ? formatDuration(entrySeconds(entry, tick)) : "Live"}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-4 break-words text-sm leading-6 text-zinc-500">{entry.workSummary || "No note added."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <TimerReset className="mx-auto h-8 w-8 text-zinc-300" />
                  <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">No owner time logged</p>
                  <p className="mt-1 text-xs text-zinc-400">This day has no clock-ins.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-32">
          <OwnerTimeClock onChange={() => void loadEntries()} />

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
            <div className="flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-zinc-400" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Owner totals</p>
                <p className="truncate text-xs text-zinc-500">{rangeLabel}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {ownerTotals.length ? (
                ownerTotals.map((owner) => {
                  const percent = Math.round((owner.seconds / maxOwnerSeconds) * 100);
                  return (
                    <div key={owner.user.id}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate font-semibold">{owner.user.name}</span>
                        <span className="shrink-0 tabular-nums text-zinc-500">{formatDuration(owner.seconds)}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--brand-emerald))]" style={{ width: `${Math.max(8, percent)}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">{owner.sessions} session{owner.sessions === 1 ? "" : "s"}</p>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-5 text-center text-xs text-zinc-500">
                  No owner time in this range.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
