"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarPlus, Clock3, FileCheck2, Flame, Gauge, LogIn, LogOut, NotebookPen, Pencil, Plus, Save, TimerReset, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
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

type TodayOwnerTotal = {
  name: string;
  email: string;
  seconds: number;
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
  todayByUser: Record<string, TodayOwnerTotal>;
  insights: WorkLogInsights;
};

type BusyState = "clock-in" | "clock-out" | "manual" | "save" | "edit" | null;

type OwnerTimeClockProps = {
  onChange?: () => void;
};

type ManualForm = {
  date: string;
  startTime: string;
  endTime: string;
  workSummary: string;
};

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
  return `${remainingSeconds}s`;
}

function formatClockTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function inputDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function inputTime(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

function defaultManualForm(): ManualForm {
  const end = new Date();
  end.setSeconds(0, 0);
  end.setMinutes(Math.floor(end.getMinutes() / 15) * 15);
  const start = new Date(end);
  start.setHours(start.getHours() - 1);
  return {
    date: inputDate(end),
    startTime: inputTime(start),
    endTime: inputTime(end),
    workSummary: "",
  };
}

function formFromEntry(entry: WorkLogEntry): ManualForm {
  const start = new Date(entry.startedAt);
  const end = entry.endedAt ? new Date(entry.endedAt) : new Date();
  return {
    date: inputDate(start),
    startTime: inputTime(start),
    endTime: inputTime(end),
    workSummary: entry.workSummary,
  };
}

function localDateTime(date: string, time: string) {
  if (!date || !time) return null;
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

function resolveManualRange(form: ManualForm) {
  const startedAt = localDateTime(form.date, form.startTime);
  const rawEndedAt = localDateTime(form.date, form.endTime);
  if (!startedAt || !rawEndedAt) return { startedAt, endedAt: rawEndedAt, overnight: false };

  const endedAt = new Date(rawEndedAt);
  const overnight = endedAt < startedAt;
  if (overnight) endedAt.setDate(endedAt.getDate() + 1);

  return { startedAt, endedAt, overnight };
}

function manualFormFromFormData(formData: FormData): ManualForm {
  return {
    date: String(formData.get("manualDate") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? ""),
    workSummary: String(formData.get("workSummary") ?? ""),
  };
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(value);
}

async function readError(response: Response) {
  const body = await response.json().catch(() => null);
  return body?.error ?? "Something went wrong.";
}

function InsightTile({ icon: Icon, label, value, detail }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        <Icon className="h-3 w-3" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 text-base font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-zinc-500">{detail}</p>
    </div>
  );
}

export function OwnerTimeClock({ onChange }: OwnerTimeClockProps = {}) {
  const [data, setData] = useState<WorkLogResponse | null>(null);
  const [summary, setSummary] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualForm, setManualForm] = useState<ManualForm>({ date: "", startTime: "", endTime: "", workSummary: "" });
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ManualForm>({ date: "", startTime: "", endTime: "", workSummary: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyState>(null);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [tick, setTick] = useState(0);

  const loadEntries = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/owner/work-log", { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      const nextData = (await response.json()) as WorkLogResponse;
      setData(nextData);
      setSummary(nextData.activeEntry?.workSummary ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load owner work log.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    setManualForm(defaultManualForm());
  }, []);

  const activeEntry = data?.activeEntry ?? null;
  const activeEntryId = activeEntry?.id ?? "";
  const insights = data?.insights;
  const manualRange = useMemo(() => resolveManualRange(manualForm), [manualForm]);
  const editRange = useMemo(() => resolveManualRange(editForm), [editForm]);

  useEffect(() => {
    if (!activeEntryId) return;
    setTick(Date.now());
    const timer = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeEntryId]);

  const elapsedSeconds = activeEntry ? (() => {
    const startTime = new Date(activeEntry.startedAt).getTime();
    const endTime = activeEntry.endedAt
      ? new Date(activeEntry.endedAt).getTime()
      : tick || startTime + activeEntry.durationSeconds * 1000;
    return Math.max(0, Math.round((endTime - startTime) / 1000));
  })() : 0;

  const todayTotals = useMemo(
    () => Object.values(data?.todayByUser ?? {}).sort((a, b) => a.name.localeCompare(b.name)),
    [data?.todayByUser],
  );

  async function runAction(action: "clock-in" | "clock-out") {
    setBusy(action);
    setError("");
    setSavedMessage("");
    try {
      const response = await fetch("/api/owner/work-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, workSummary: summary }),
      });
      if (!response.ok) throw new Error(await readError(response));
      await loadEntries(true);
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the time clock.");
    } finally {
      setBusy(null);
    }
  }

  async function saveNote() {
    if (!activeEntry) return;
    setBusy("save");
    setError("");
    setSavedMessage("");
    try {
      const response = await fetch("/api/owner/work-log", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeEntry.id, workSummary: summary }),
      });
      if (!response.ok) throw new Error(await readError(response));
      await loadEntries(true);
      onChange?.();
      setSavedMessage(`Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the work note.");
    } finally {
      setBusy(null);
    }
  }

  function startEditingEntry(entry: WorkLogEntry) {
    setManualOpen(false);
    setEditingEntryId(entry.id);
    setEditForm(formFromEntry(entry));
    setError("");
    setSavedMessage("");
  }

  function cancelEditingEntry() {
    setEditingEntryId(null);
    setEditForm({ date: "", startTime: "", endTime: "", workSummary: "" });
  }

  async function saveEditedEntry(event: React.FormEvent<HTMLFormElement>, entryId: string) {
    event.preventDefault();
    const submittedForm = manualFormFromFormData(new FormData(event.currentTarget));
    setEditForm(submittedForm);

    const { startedAt, endedAt } = resolveManualRange(submittedForm);
    if (!startedAt || !endedAt) {
      setError("Start and end times are required.");
      return;
    }

    setBusy("edit");
    setError("");
    setSavedMessage("");
    try {
      const response = await fetch("/api/owner/work-log", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entryId,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          workSummary: submittedForm.workSummary,
        }),
      });
      if (!response.ok) throw new Error(await readError(response));
      await loadEntries(true);
      onChange?.();
      setEditingEntryId(null);
      setSavedMessage("Updated work entry.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the work entry.");
    } finally {
      setBusy(null);
    }
  }

  async function postManualEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedForm = manualFormFromFormData(new FormData(event.currentTarget));
    setManualForm(submittedForm);

    const { startedAt, endedAt } = resolveManualRange(submittedForm);
    if (!startedAt || !endedAt) {
      setError("Start and end times are required.");
      return;
    }

    setBusy("manual");
    setError("");
    setSavedMessage("");
    try {
      const response = await fetch("/api/owner/work-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual-entry",
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          workSummary: submittedForm.workSummary,
        }),
      });
      if (!response.ok) throw new Error(await readError(response));
      await loadEntries(true);
      onChange?.();
      setManualForm({ ...defaultManualForm(), workSummary: "" });
      setManualOpen(false);
      setSavedMessage("Posted missed work entry.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post the missed work entry.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--accent),var(--brand-emerald))] text-white shadow-sm">
            <Clock3 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-base">Owner time clock</CardTitle>
            <CardDescription>Ashish and Terri work log</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-28 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          </div>
        ) : (
          <>
            {todayTotals.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {todayTotals.map((owner) => (
                  <div key={owner.email} className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                      <UsersRound className="h-3 w-3" />
                      <span className="truncate">{owner.name.split(" ")[0]}</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold tabular-nums">{formatDuration(owner.seconds)}</p>
                  </div>
                ))}
              </div>
            )}

            {insights && (
              <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Gauge className="h-4 w-4 shrink-0 text-zinc-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">Productivity pulse</p>
                      <p className="text-xs text-zinc-500">{insights.productivityLabel}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-semibold tabular-nums text-white dark:bg-white dark:text-zinc-950">
                    {insights.productivityScore}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-900/10 dark:bg-white/10">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--brand-emerald))] transition-all"
                    style={{ width: `${Math.max(4, Math.min(100, insights.productivityScore))}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <InsightTile icon={Clock3} label="Today" value={formatDuration(insights.todaySeconds)} detail="Logged hours" />
                  <InsightTile icon={BarChart3} label="Week" value={formatDuration(insights.weekSeconds)} detail="This week" />
                  <InsightTile icon={TimerReset} label="Avg block" value={formatDuration(insights.averageSessionSeconds)} detail={`${insights.completedCount} closed`} />
                  <InsightTile icon={FileCheck2} label="Notes" value={`${insights.documentedPercent}%`} detail="Documented" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">7-day hours</span>
                    <span className="text-zinc-500">{formatDuration(insights.monthSeconds)} this month</span>
                  </div>
                  <div className="flex h-20 items-end gap-1.5">
                    {insights.last7Days.map((day) => (
                      <div key={day.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                        <div className="flex h-full w-full items-end rounded-md bg-zinc-900/5 p-0.5 dark:bg-white/5">
                          <div
                            className={cn(
                              "w-full rounded-[5px] bg-[linear-gradient(180deg,var(--accent),var(--brand-emerald))]",
                              day.seconds === 0 && "bg-zinc-300 dark:bg-zinc-800",
                            )}
                            style={{ height: `${day.seconds ? Math.max(10, day.percent) : 3}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-400">{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {insights.ownerBreakdown.length > 0 && (
                  <div className="space-y-2 border-t border-[var(--border)] pt-3">
                    {insights.ownerBreakdown.map((owner) => (
                      <div key={owner.email} className="flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{owner.name}</p>
                          <p className="text-zinc-500">{owner.sessions} sessions · {owner.documentedSessions} noted</p>
                        </div>
                        <span className="shrink-0 font-semibold tabular-nums">{formatDuration(owner.seconds)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-lg bg-zinc-900/5 px-3 py-2 text-xs text-zinc-500 dark:bg-white/5">
                  <Flame className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span>{insights.streakDays} day streak · {insights.completedPercent}% sessions closed</span>
                </div>
              </div>
            )}

            {activeEntry ? (
              <div className="rounded-lg border border-emerald-300/70 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Clocked in
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">Started {formatClockTime(activeEntry.startedAt)}</p>
                  </div>
                  <div className="rounded-lg bg-white px-3 py-2 text-right shadow-sm dark:bg-zinc-950">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Live</p>
                    <p className="text-xl font-semibold tabular-nums">{formatDuration(elapsedSeconds)}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="owner-work-summary">Work completed</Label>
                  <Textarea
                    id="owner-work-summary"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="Calls, proposals, coding, client updates..."
                    className="min-h-28 bg-white/90 dark:bg-zinc-950/80"
                  />
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="w-full sm:flex-1" disabled={Boolean(busy)} onClick={() => void saveNote()}>
                    <Save className="h-4 w-4" />
                    {busy === "save" ? "Saving..." : "Save note"}
                  </Button>
                  <Button type="button" className="w-full sm:flex-1" disabled={Boolean(busy)} onClick={() => void runAction("clock-out")}>
                    <LogOut className="h-4 w-4" />
                    {busy === "clock-out" ? "Clocking out..." : "Clock out"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
                    <TimerReset className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Ready for the next work block</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">Clock in first, then add the work summary before you clock out.</p>
                  </div>
                </div>
                <Button type="button" className="mt-4 w-full" disabled={Boolean(busy)} onClick={() => void runAction("clock-in")}>
                  <LogIn className="h-4 w-4" />
                  {busy === "clock-in" ? "Clocking in..." : "Clock in"}
                </Button>
              </div>
            )}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)]">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                onClick={() => setManualOpen((open) => !open)}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-sm dark:bg-zinc-950 dark:text-zinc-200">
                  <CalendarPlus className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Post missed clock</span>
                  <span className="block truncate text-xs text-zinc-500">Backfill a work block you forgot to clock.</span>
                </span>
                {manualOpen ? <X className="h-4 w-4 shrink-0 text-zinc-400" /> : <Plus className="h-4 w-4 shrink-0 text-zinc-400" />}
              </button>

              {manualOpen && (
                <form className="space-y-3 border-t border-[var(--border)] p-4" onSubmit={(event) => void postManualEntry(event)}>
                  <div className="space-y-1.5">
                    <Label htmlFor="manual-work-date">Date</Label>
                    <Input
                      id="manual-work-date"
                      name="manualDate"
                      type="date"
                      value={manualForm.date}
                      onChange={(event) => setManualForm((form) => ({ ...form, date: event.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="manual-work-start">Start</Label>
                      <Input
                        id="manual-work-start"
                        name="startTime"
                        type="time"
                        value={manualForm.startTime}
                        onChange={(event) => setManualForm((form) => ({ ...form, startTime: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="manual-work-end">End</Label>
                      <Input
                        id="manual-work-end"
                        name="endTime"
                        type="time"
                        value={manualForm.endTime}
                        onChange={(event) => setManualForm((form) => ({ ...form, endTime: event.target.value }))}
                      />
                    </div>
                  </div>
                  {manualRange.overnight && manualRange.endedAt && (
                    <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200">
                      Ends next day, {formatShortDate(manualRange.endedAt)}.
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="manual-work-summary">Work completed</Label>
                    <Textarea
                      id="manual-work-summary"
                      name="workSummary"
                      value={manualForm.workSummary}
                      onChange={(event) => setManualForm((form) => ({ ...form, workSummary: event.target.value }))}
                      placeholder="What did you get done?"
                      className="min-h-24"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={Boolean(busy)}>
                    <CalendarPlus className="h-4 w-4" />
                    {busy === "manual" ? "Posting..." : "Post entry"}
                  </Button>
                </form>
              )}
            </div>

            {(error || savedMessage) && (
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  error
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
                )}
              >
                {error || savedMessage}
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-zinc-400" />
                <p className="text-sm font-semibold">Recent owner work</p>
              </div>
              {data?.recentEntries.length ? (
                <div className="space-y-2">
                  {data.recentEntries.slice(0, 5).map((entry) => {
                    const isEditing = editingEntryId === entry.id;
                    const canEdit = entry.user.id === data.viewerId;

                    return (
                      <div key={entry.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{entry.user.name}</p>
                            <p className="mt-0.5 text-xs text-zinc-500">{formatClockTime(entry.startedAt)}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {canEdit && (
                              <Button
                                type="button"
                                variant={isEditing ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                disabled={Boolean(busy)}
                                onClick={() => isEditing ? cancelEditingEntry() : startEditingEntry(entry)}
                                aria-label={isEditing ? "Close edit punch" : "Edit punch"}
                                title={isEditing ? "Close edit punch" : "Edit punch"}
                              >
                                {isEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                              </Button>
                            )}
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                                entry.endedAt
                                  ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                              )}
                            >
                              {entry.endedAt ? formatDuration(entry.durationSeconds) : "Live"}
                            </span>
                          </div>
                        </div>

                        {isEditing ? (
                          <form className="mt-3 space-y-3 border-t border-[var(--border)] pt-3" onSubmit={(event) => void saveEditedEntry(event, entry.id)}>
                            <div className="space-y-1.5">
                              <Label htmlFor={`edit-work-date-${entry.id}`}>Date</Label>
                              <Input
                                id={`edit-work-date-${entry.id}`}
                                name="manualDate"
                                type="date"
                                value={editForm.date}
                                onChange={(event) => setEditForm((form) => ({ ...form, date: event.target.value }))}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1.5">
                                <Label htmlFor={`edit-work-start-${entry.id}`}>Start</Label>
                                <Input
                                  id={`edit-work-start-${entry.id}`}
                                  name="startTime"
                                  type="time"
                                  value={editForm.startTime}
                                  onChange={(event) => setEditForm((form) => ({ ...form, startTime: event.target.value }))}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`edit-work-end-${entry.id}`}>End</Label>
                                <Input
                                  id={`edit-work-end-${entry.id}`}
                                  name="endTime"
                                  type="time"
                                  value={editForm.endTime}
                                  onChange={(event) => setEditForm((form) => ({ ...form, endTime: event.target.value }))}
                                />
                              </div>
                            </div>
                            {editRange.overnight && editRange.endedAt && (
                              <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200">
                                Ends next day, {formatShortDate(editRange.endedAt)}.
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <Label htmlFor={`edit-work-summary-${entry.id}`}>Work completed</Label>
                              <Textarea
                                id={`edit-work-summary-${entry.id}`}
                                name="workSummary"
                                value={editForm.workSummary}
                                onChange={(event) => setEditForm((form) => ({ ...form, workSummary: event.target.value }))}
                                placeholder="What did you get done?"
                                className="min-h-24"
                              />
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button type="button" variant="outline" className="w-full sm:flex-1" disabled={Boolean(busy)} onClick={cancelEditingEntry}>
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                              <Button type="submit" className="w-full sm:flex-1" disabled={Boolean(busy)}>
                                <Save className="h-4 w-4" />
                                {busy === "edit" ? "Saving..." : "Save punch"}
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-zinc-500">
                            {entry.workSummary || "No note added yet."}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-5 text-center text-xs text-zinc-500">
                  No owner work has been logged yet.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
