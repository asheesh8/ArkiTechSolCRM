"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { checkPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

// One conversation, read back out of Twilio's message log.
//
// There is no inbound webhook yet, so nothing pushes a reply into this app —
// but Twilio records every message the number receives regardless, so reopening
// a thread shows what came back. That is enough to work a funnel by hand, which
// is what this is for; being *told* about a reply needs a webhook this app does
// not have.

type ThreadMessage = {
  sid: string;
  body: string;
  outbound: boolean;
  status: string;
  at: string | null;
  errorMessage: string | null;
};

function timeLabel(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const sameDay = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(undefined, sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
  ).format(date);
}

export function MessageThread({
  phone,
  title,
  onBack,
}: {
  phone: string;
  title: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(
    (quiet = false) => {
      if (!quiet) setLoading(true);
      setError("");
      fetch(`/api/messages/thread?with=${encodeURIComponent(phone)}`, { cache: "no-store" })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || "Couldn't load that conversation.");
          setMessages(data.messages ?? []);
        })
        .catch((cause) => setError(cause instanceof Error ? cause.message : "Couldn't load that conversation."))
        .finally(() => setLoading(false));
    },
    [phone],
  );

  useEffect(() => load(), [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send() {
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    setSendError("");
    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, body }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSendError(data.error || "Couldn't send that text.");
        return;
      }
      setDraft("");
      // Refetch rather than guessing at the shape of what Twilio stored.
      load(true);
    } catch {
      setSendError("Couldn't reach the server.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to the lead list">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-[var(--muted)]">{checkPhone(phone).national || phone}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => load()} aria-label="Check for replies" title="Check for replies">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-64 max-h-[26rem] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
        {loading ? (
          <div className="flex min-h-56 items-center justify-center text-[var(--muted)]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : error ? (
          <p className="py-12 text-center text-xs leading-5 text-[var(--muted)]">{error}</p>
        ) : messages.length === 0 ? (
          <p className="py-12 text-center text-xs leading-5 text-[var(--muted)]">
            Nothing sent to this number yet. Whatever you send below starts the thread.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <div
                key={message.sid}
                className={cn("flex flex-col", message.outbound ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5",
                    message.outbound
                      ? "rounded-br-sm bg-[var(--accent)] text-white"
                      : "rounded-bl-sm bg-[var(--surface)] ring-1 ring-[var(--border)]",
                  )}
                >
                  {message.body}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-[var(--muted)]">
                  {timeLabel(message.at)}
                  {message.errorMessage ? ` · ${message.errorMessage}` : message.status === "queued" ? " · sending" : ""}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a reply…"
          className="min-h-20"
        />
        {sendError ? (
          <p className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400" role="alert">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {sendError}
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-[var(--muted)]">{draft.length} chars</span>
          <Button onClick={send} disabled={sending || !draft.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
