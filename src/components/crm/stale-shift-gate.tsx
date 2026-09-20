"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

type StaleShiftGateProps = {
  entryStartedAt: string;
  userName: string;
  /** How long it has been running, worded by the server. Computed there rather
   *  than here because reading the clock during render is impure and would
   *  disagree between the server pass and hydration. */
  openForLabel: string;
};

function twoDigit(value: number) {
  return String(value).padStart(2, "0");
}

function inputDate(value: Date) {
  return `${value.getFullYear()}-${twoDigit(value.getMonth() + 1)}-${twoDigit(value.getDate())}`;
}

function localDateTime(date: string, time: string) {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatWhen(value: Date) {
  return value.toLocaleString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Blocks the CRM until a forgotten clock-in is closed properly.
 *
 * The default end time is deliberately left empty rather than prefilled with
 * "now". Somebody who clocked in on Friday and came back Monday would otherwise
 * accept the default and log a 72 hour shift, which is the exact problem this
 * screen exists to stop.
 */
export function StaleShiftGate({ entryStartedAt, userName, openForLabel }: StaleShiftGateProps) {
  const router = useRouter();
  const startedAt = new Date(entryStartedAt);

  const [date, setDate] = useState(inputDate(startedAt));
  const [time, setTime] = useState("");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const endedAt = localDateTime(date, time);
  const shiftSeconds = endedAt ? Math.round((endedAt.getTime() - startedAt.getTime()) / 1_000) : 0;
  const ready = Boolean(endedAt) && shiftSeconds > 0 && summary.trim().length > 0;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endedAt) return;

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/owner/work-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "close-stale",
          endedAt: endedAt.toISOString(),
          workSummary: summary,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not close that shift.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not close that shift.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--surface)] p-4">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold">You never clocked out, {userName}</h1>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              You clocked in {formatWhen(startedAt)} and the clock has been running {openForLabel}{" "}
              since. Close it out properly and the CRM opens back up.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stale-date">Date you finished</Label>
              <Input
                id="stale-date"
                type="date"
                value={date}
                min={inputDate(startedAt)}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stale-time">Time you finished</Label>
              <Input
                id="stale-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </div>
          </div>

          {endedAt && shiftSeconds > 0 ? (
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock3 className="h-3.5 w-3.5" />
              That logs a {(shiftSeconds / 3_600).toFixed(2)} hour shift.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="stale-summary">What did you work on?</Label>
            <Textarea
              id="stale-summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Calls made, work shipped, meetings — enough that someone reading it later knows what the time bought."
              className="min-h-28"
              required
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={!ready || busy}>
            {busy ? "Closing..." : "Close the shift and continue"}
          </Button>
          {!ready && !busy ? (
            <p className="text-center text-xs text-zinc-500">
              Both the finish time and a note are required.
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
