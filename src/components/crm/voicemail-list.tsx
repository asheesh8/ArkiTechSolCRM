"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2, PhoneOutgoing, RotateCcw, Voicemail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkPhone } from "@/lib/phone";

// Messages left on this number, newest first, playable in place.

type VoicemailRow = {
  sid: string;
  from: string | null;
  durationSecs: number;
  at: string | null;
  lead: { id: string; businessName: string } | null;
};

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

export function VoicemailList({ onCallBack }: { onCallBack: (e164: string) => void }) {
  const [rows, setRows] = useState<VoicemailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/calls/voicemail", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Couldn't load your voicemail.");
        setRows(data.voicemails ?? []);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Couldn't load your voicemail."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading && rows.length === 0) {
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

  if (rows.length === 0) {
    return (
      <div className="space-y-3 py-8 text-center">
        <Voicemail className="mx-auto h-6 w-6 text-[var(--muted)]" aria-hidden="true" />
        <p className="text-xs leading-5 text-[var(--muted)]">
          No messages yet. Anything left on your number shows up here once the greeting is live on it.
        </p>
        <Button variant="outline" size="sm" onClick={load}>
          <RotateCcw className="h-3.5 w-3.5" />
          Check again
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => {
        const pretty = row.from ? checkPhone(row.from).national || row.from : "Unknown caller";
        return (
          <li key={row.sid} className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-2.5">
            <div className="flex items-start gap-2">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  {row.lead ? <Building2 className="h-3 w-3 shrink-0 text-[var(--accent)]" /> : null}
                  <span className="truncate text-sm font-semibold">{row.lead?.businessName ?? pretty}</span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-[var(--muted)]">
                  {[row.lead ? pretty : null, whenLabel(row.at), row.durationSecs ? `${row.durationSecs}s` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              {row.from ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCallBack(row.from!)}
                  aria-label={`Call ${pretty} back`}
                  title="Call back"
                >
                  <PhoneOutgoing className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            <audio
              controls
              preload="none"
              src={`/api/calls/voicemail/${encodeURIComponent(row.sid)}/audio`}
              className="mt-2 h-9 w-full"
              aria-label={`Message from ${pretty}`}
            >
              Your browser does not support audio playback.
            </audio>
          </li>
        );
      })}
    </ul>
  );
}
