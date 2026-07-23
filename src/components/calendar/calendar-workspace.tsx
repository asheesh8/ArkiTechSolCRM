"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, ExternalLink, Loader2, MapPin, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  calendarId: string;
  calendarName: string;
  title: string;
  description: string | null;
  location: string | null;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink: string | null;
  status: string;
  organizer: string | null;
  attendees: Array<{ name: string; email: string | null; responseStatus: string | null }>;
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

function eventStart(event: CalendarEvent) {
  if (event.allDay) return new Date(`${event.start}T00:00:00`);
  return new Date(event.start);
}

function formatTime(event: CalendarEvent) {
  if (event.allDay) return "All day";
  const start = new Date(event.start);
  const end = new Date(event.end);
  return `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function calendarColor(value: string) {
  const colors = [
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200",
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
  ];
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return colors[hash % colors.length];
}

export function CalendarWorkspace() {
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(anchor, i)), [anchor]);
  const rangeLabel = `${days[0].toLocaleDateString([], { month: "short", day: "numeric" })} - ${days[6].toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const timeMin = anchor.toISOString();
    const timeMax = addDays(anchor, 7).toISOString();
    try {
      const res = await fetch(`/api/calendar/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not load calendar");
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      setEvents([]);
      setError(err instanceof Error ? err.message : "Could not load calendar");
    } finally {
      setLoading(false);
    }
  }, [anchor]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const day of days) map.set(day.toDateString(), []);
    for (const event of events) {
      const key = eventStart(event).toDateString();
      if (map.has(key)) map.get(key)!.push(event);
    }
    return map;
  }, [days, events]);

  const selectedEvents = eventsByDay.get(selectedDay.toDateString()) ?? [];
  const today = new Date();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Calendar</h2>
          <p className="mt-1 text-sm text-zinc-500">Ashish and Terri&apos;s shared Google Calendar inside the CRM.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAnchor(addDays(anchor, -7))}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { const now = new Date(); setAnchor(startOfWeek(now)); setSelectedDay(now); }}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAnchor(addDays(anchor, 7))}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Refresh calendar" onClick={() => void loadEvents()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </section>

      {error && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Calendar needs connection</p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-zinc-500" />
              <CardTitle>{rangeLabel}</CardTitle>
            </div>
            <span className="text-xs text-zinc-500">{events.length} event{events.length === 1 ? "" : "s"}</span>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 lg:grid-cols-7">
              {days.map((day) => {
                const dayEvents = eventsByDay.get(day.toDateString()) ?? [];
                const active = sameDay(day, selectedDay);
                const isToday = sameDay(day, today);
                return (
                  <button
                    key={day.toDateString()}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "min-h-40 rounded-lg border border-zinc-200 bg-white p-3 text-left transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60",
                      active && "border-[var(--accent)] ring-1 ring-[var(--accent)]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium uppercase text-zinc-400">{day.toLocaleDateString([], { weekday: "short" })}</p>
                        <p className={cn("mt-0.5 text-lg font-semibold", isToday && "text-[var(--accent)]")}>{day.getDate()}</p>
                      </div>
                      {dayEvents.length > 0 && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{dayEvents.length}</span>
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      {loading ? (
                        <div className="space-y-2">
                          <div className="h-7 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                          <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                        </div>
                      ) : dayEvents.length ? (
                        dayEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className={cn("truncate rounded-md border px-2 py-1.5 text-xs font-medium", calendarColor(event.calendarId))}>
                            {event.allDay ? "" : `${new Date(event.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} `}
                            {event.title}
                          </div>
                        ))
                      ) : (
                        <p className="pt-6 text-center text-xs text-zinc-400">No events</p>
                      )}
                      {dayEvents.length > 3 && <p className="text-xs text-zinc-400">+{dayEvents.length - 3} more</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>{selectedDay.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />)}
              </div>
            ) : selectedEvents.length ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div key={event.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{event.title}</p>
                        <p className="mt-1 inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{event.calendarName}</p>
                      </div>
                      {event.htmlLink && (
                        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" title="Open in Google Calendar">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-zinc-500">
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {formatTime(event)}</p>
                      {event.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</p>}
                      {event.attendees.length > 0 && <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {event.attendees.length} attendee{event.attendees.length === 1 ? "" : "s"}</p>}
                    </div>
                    {event.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">{event.description.replace(/<[^>]+>/g, " ")}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-zinc-300" />
                <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">Nothing scheduled</p>
                <p className="mt-1 text-xs text-zinc-400">This day is clear on the shared calendar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
