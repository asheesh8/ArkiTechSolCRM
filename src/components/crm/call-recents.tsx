"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2, PhoneIncoming, PhoneMissed, PhoneOutgoing, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

// Recent calls, straight off the rep's Twilio account. Tapping one loads it
// back into the keypad, which is the whole point: the number you want next is
// almost always one you already dialled.

export type RecentCall = {
  sid: string;
  counterparty: string | null;
  outbound: boolean;
  status: string;
  durationSecs: number;
  startedAt: string | null;
  lead: { id: string; businessName: string } | null;
};

// Twilio's own vocabulary for a call nobody picked up.
const MISSED = new Set(["no-answer", "busy", "failed", "canceled"]);

function whenLabel(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const sameDay = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(undefined, sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
  ).format(date);
}

function durationLabel(seconds: number) {
  if (!seconds) return null;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function CallRecents({ onPick, refreshKey }: { onPick: (e164: string) => void; refreshKey: number }) {
  const [calls, setCalls] = useState<RecentCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/calls/history", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Couldn't load your recent calls.");
        setCalls(data.calls ?? []);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Couldn't load your recent calls."))
      .finally(() => setLoading(false));
  }, []);

  // Reloads when a call finishes, so the list a rep looks at after hanging up
  // already has the call they just made on it.
  useEffect(load, [load, refreshKey]);

  if (loading && calls.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center text-[var(--muted)]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 py-6 text-center">
        <p className="text-xs leading-5 text-[var(--muted)]">{error}</p>
        <Button variant="outline" size="sm" onClick={load}>
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <p className="py-10 text-center text-xs leading-5 text-[var(--muted)]">
        No calls on this number yet. The ones you place here will show up.
      </p>
    );
  }

  return (
    <ul className="-mx-1 divide-y divide-[var(--border)]">
      {calls.map((call) => {
        const missed = MISSED.has(call.status);
        const Icon = missed ? PhoneMissed : call.outbound ? PhoneOutgoing : PhoneIncoming;
        const pretty = call.counterparty ? checkPhone(call.counterparty).national || call.counterparty : "Unknown";
        const length = durationLabel(call.durationSecs);

        return (
          <li key={call.sid}>
            <button
              type="button"
              onClick={() => call.counterparty && onPick(call.counterparty)}
              disabled={!call.counterparty}
              className="flex w-full items-center gap-2.5 px-1 py-2.5 text-left transition hover:bg-[var(--surface-strong)] disabled:opacity-50"
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  missed ? "text-red-500" : call.outbound ? "text-[var(--muted)]" : "text-emerald-600",
                )}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  {call.lead ? <Building2 className="h-3 w-3 shrink-0 text-[var(--accent)]" /> : null}
                  <span className="truncate text-sm font-semibold">{call.lead?.businessName ?? pretty}</span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-[var(--muted)]">
                  {[call.lead ? pretty : null, whenLabel(call.startedAt), length]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
