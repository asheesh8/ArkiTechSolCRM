"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  Languages,
  Loader2,
  MessageSquareText,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  RefreshCw,
  Save,
  Search,
  Timer,
  UserRound,
  Volume2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type ConversationSummary = {
  id: string;
  title: string | null;
  summary: string | null;
  callerPhone: string | null;
  agentPhone: string | null;
  status: string;
  callSuccessful: boolean | string | null;
  startedAt: string;
  endedAt: string | null;
  durationSecs: number;
  messageCount: number;
  hasAudio: boolean;
  direction: string | null;
  initiationSource: string | null;
  mainLanguage: string | null;
  terminationReason: string | null;
  syncedAt: string;
  lead?: { id: string; businessName: string } | null;
};

type TranscriptMessage = {
  id: string;
  sequence: number;
  role: string;
  message: string | null;
  timeInCallSecs: number | null;
  interrupted: boolean;
  sourceMedium: string | null;
};

type ConversationDetail = ConversationSummary & {
  internalNote: string | null;
  messages: TranscriptMessage[];
};

type ConversationStats = {
  total: number;
  successful: number;
  failed: number;
  totalSeconds: number;
  avgDurationSecs: number;
};

type ListResponse = {
  conversations: ConversationSummary[];
  stats: ConversationStats;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
  lastSyncedAt: string | null;
  agentName: string | null;
  sources?: string[];
};

type SyncResponse = {
  sync?: {
    scanned: number;
    archived: number;
    refreshed: number;
    unchanged: number;
    errors: number;
  };
};

const EMPTY_STATS: ConversationStats = {
  total: 0,
  successful: 0,
  failed: 0,
  totalSeconds: 0,
  avgDurationSecs: 0,
};

const EMPTY_PAGINATION = { page: 1, pageSize: 20, total: 0, pages: 1 };

function readableLabel(value: string | null | undefined) {
  if (!value) return "Not available";
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return new Intl.DateTimeFormat(undefined, sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
  ).format(date);
}

function formatDuration(seconds: number | null | undefined) {
  const safeSeconds = Math.max(0, Math.round(seconds ?? 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;

  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function formatTalkTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${safeSeconds}s`;
}

function callWasSuccessful(value: ConversationSummary["callSuccessful"]) {
  if (typeof value === "boolean") return value;
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (["true", "success", "successful", "yes"].includes(normalized)) return true;
  if (["false", "failure", "failed", "no", "unsuccessful"].includes(normalized)) return false;
  return null;
}

function getOutcome(conversation: ConversationSummary) {
  const successful = callWasSuccessful(conversation.callSuccessful);
  if (successful === true) {
    return {
      label: "Successful",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
      icon: CheckCircle2,
    };
  }
  if (successful === false) {
    return {
      label: "Needs follow-up",
      className: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900",
      icon: XCircle,
    };
  }
  return {
    label: readableLabel(conversation.status),
    className: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
    icon: Clock,
  };
}

function getConversationTitle(conversation: ConversationSummary) {
  return conversation.title?.trim()
    || conversation.lead?.businessName
    || conversation.callerPhone
    || "Unknown caller";
}

function isOutboundCall(direction: string | null) {
  return direction?.toLowerCase().includes("out") ?? false;
}

async function responseError(response: Response, fallback: string) {
  try {
    const body = await response.json() as { error?: string; message?: string };
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Headphones;
  tone: string;
}) {
  return (
    <Card className="overflow-hidden shadow-none">
      <CardContent className="flex items-center gap-3 p-4 sm:p-5">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tone)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-zinc-500">{label}</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{value}</p>
          <p className="truncate text-[11px] text-zinc-400">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OutcomeBadge({ conversation }: { conversation: ConversationSummary }) {
  const outcome = getOutcome(conversation);
  const Icon = outcome.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ring-1", outcome.className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {outcome.label}
    </span>
  );
}

function ConversationCard({
  conversation,
  selected,
  onSelect,
}: {
  conversation: ConversationSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  const title = getConversationTitle(conversation);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Open conversation: ${title}`}
      className={cn(
        "group w-full rounded-xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950",
        selected
          ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          selected
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "bg-zinc-100 text-zinc-500 group-hover:text-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100",
        )}>
          {isOutboundCall(conversation.direction)
            ? <PhoneOutgoing className="h-4 w-4" aria-hidden="true" />
            : <PhoneIncoming className="h-4 w-4" aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
            <span className="shrink-0 text-[11px] text-zinc-400">{formatShortDate(conversation.startedAt)}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <OutcomeBadge conversation={conversation} />
            {conversation.lead && (
              <span className="max-w-40 truncate rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {conversation.lead.businessName}
              </span>
            )}
          </span>
          <span className="mt-2 block min-h-9 text-xs leading-[1.125rem] text-zinc-500 line-clamp-2 dark:text-zinc-400">
            {conversation.summary || "No call summary was generated."}
          </span>
          <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <Timer className="h-3 w-3" aria-hidden="true" />
              {formatDuration(conversation.durationSecs)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquareText className="h-3 w-3" aria-hidden="true" />
              {conversation.messageCount} message{conversation.messageCount === 1 ? "" : "s"}
            </span>
            {conversation.hasAudio && (
              <span className="inline-flex items-center gap-1">
                <Volume2 className="h-3 w-3" aria-hidden="true" />
                Recording
              </span>
            )}
          </span>
        </span>
      </div>
    </button>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-3 p-4" aria-label="Loading conversations" role="status">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border border-zinc-200 p-4 motion-reduce:animate-none dark:border-zinc-800">
          <div className="flex gap-3">
            <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-3/5 rounded bg-zinc-100 dark:bg-zinc-900" />
              <div className="h-5 w-24 rounded-full bg-zinc-100 dark:bg-zinc-900" />
              <div className="h-8 rounded bg-zinc-100 dark:bg-zinc-900" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading conversations…</span>
    </div>
  );
}

function DetailPlaceholder() {
  return (
    <div className="flex h-full min-h-[460px] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900">
        <Headphones className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-base font-semibold">Select a conversation</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
        Open a call to review its summary, recording, full transcript, and private team notes.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: TranscriptMessage }) {
  const normalizedRole = message.role.toLowerCase();
  const fromAgent = ["agent", "assistant", "ai"].includes(normalizedRole);
  const isSystem = ["system", "tool"].includes(normalizedRole);

  if (isSystem) {
    return (
      <div className="mx-auto max-w-xl rounded-lg bg-zinc-100 px-3 py-2 text-center text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
        {message.message || "System event"}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2.5", fromAgent ? "justify-start" : "justify-end")}>
      {fromAgent && (
        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}
      <div className={cn("max-w-[82%]", fromAgent ? "items-start" : "items-end")}>
        <div className={cn(
          "rounded-2xl px-3.5 py-2.5 text-sm leading-6",
          fromAgent
            ? "rounded-tl-md bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            : "rounded-tr-md bg-[var(--accent)] text-[var(--accent-foreground)]",
        )}>
          <p className="whitespace-pre-wrap break-words">{message.message || "No transcript text"}</p>
        </div>
        <div className={cn("mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400", !fromAgent && "justify-end")}>
          <span>{fromAgent ? "Receptionist" : "Caller"}</span>
          {message.timeInCallSecs != null && <span>· {formatDuration(message.timeInCallSecs)}</span>}
          {message.sourceMedium && <span>· {readableLabel(message.sourceMedium)}</span>}
          {message.interrupted && <span className="font-medium text-amber-600">· Interrupted</span>}
        </div>
      </div>
      {!fromAgent && (
        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{children}</div>
    </div>
  );
}

function ConversationDetailPanel({
  conversation,
  loading,
  error,
  note,
  noteSaving,
  noteStatus,
  onNoteChange,
  onSaveNote,
  onRetry,
  onBack,
}: {
  conversation: ConversationDetail | null;
  loading: boolean;
  error: string | null;
  note: string;
  noteSaving: boolean;
  noteStatus: string | null;
  onNoteChange: (value: string) => void;
  onSaveNote: () => void;
  onRetry: () => void;
  onBack: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-5 p-5" role="status" aria-label="Loading conversation details">
        <div className="animate-pulse space-y-3 motion-reduce:animate-none">
          <div className="h-5 w-2/5 rounded bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          </div>
          <div className="h-56 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <span className="sr-only">Loading conversation details…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[460px] flex-col items-center justify-center px-6 text-center" role="alert">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-semibold">Couldn&apos;t open this call</h3>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">{error}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={onBack} className="lg:hidden">Back</Button>
          <Button onClick={onRetry}>Try again</Button>
        </div>
      </div>
    );
  }

  if (!conversation) return <DetailPlaceholder />;

  const title = getConversationTitle(conversation);
  const orderedMessages = [...conversation.messages].sort((a, b) => a.sequence - b.sequence);
  const noteChanged = note !== (conversation.internalNote ?? "");

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800 sm:p-5">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] lg:hidden dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All conversations
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
              <OutcomeBadge conversation={conversation} />
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {formatDateTime(conversation.startedAt)} · {formatDuration(conversation.durationSecs)}
            </p>
          </div>
          {conversation.lead && (
            <Link
              href={`/clients/${encodeURIComponent(conversation.lead.id)}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              View lead
            </Link>
          )}
        </div>
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">AI call summary</p>
          <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {conversation.summary || "No summary was generated for this conversation."}
          </p>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-5">
        <section aria-labelledby="call-details-heading">
          <div className="flex items-center justify-between gap-3">
            <h4 id="call-details-heading" className="text-sm font-semibold">Call details</h4>
            <span className="text-[11px] text-zinc-400">Synced {formatDateTime(conversation.syncedAt)}</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <MetaItem icon={<Phone className="h-3.5 w-3.5" aria-hidden="true" />} label="Caller">
              {conversation.callerPhone ? (
                <a href={`tel:${conversation.callerPhone}`} className="hover:text-[var(--accent)] hover:underline">{conversation.callerPhone}</a>
              ) : "Unknown number"}
            </MetaItem>
            <MetaItem icon={<Headphones className="h-3.5 w-3.5" aria-hidden="true" />} label="Receptionist line">
              {conversation.agentPhone ? (
                <a href={`tel:${conversation.agentPhone}`} className="hover:text-[var(--accent)] hover:underline">{conversation.agentPhone}</a>
              ) : "Not available"}
            </MetaItem>
            <MetaItem
              icon={isOutboundCall(conversation.direction)
                ? <PhoneOutgoing className="h-3.5 w-3.5" aria-hidden="true" />
                : <PhoneIncoming className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Direction"
            >
              {readableLabel(conversation.direction)}
            </MetaItem>
            <MetaItem icon={<MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />} label="Messages">{conversation.messageCount.toLocaleString()}</MetaItem>
            <MetaItem icon={<Languages className="h-3.5 w-3.5" aria-hidden="true" />} label="Language">{readableLabel(conversation.mainLanguage)}</MetaItem>
            <MetaItem icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />} label="Ended">{formatDateTime(conversation.endedAt)}</MetaItem>
          </div>
          {(conversation.initiationSource || conversation.terminationReason) && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">
              {conversation.initiationSource && <span>Source: <strong className="font-medium text-zinc-700 dark:text-zinc-300">{readableLabel(conversation.initiationSource)}</strong></span>}
              {conversation.terminationReason && <span>Ended because: <strong className="font-medium text-zinc-700 dark:text-zinc-300">{readableLabel(conversation.terminationReason)}</strong></span>}
            </div>
          )}
        </section>

        {conversation.hasAudio && (
          <section aria-labelledby="recording-heading" className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
              <h4 id="recording-heading" className="text-sm font-semibold">Call recording</h4>
            </div>
            <audio
              controls
              preload="none"
              src={`/api/receptionist/conversations/${encodeURIComponent(conversation.id)}/audio`}
              className="h-10 w-full"
              aria-label={`Call recording for ${title}`}
            >
              Your browser does not support audio playback.
            </audio>
          </section>
        )}

        <section aria-labelledby="transcript-heading">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 id="transcript-heading" className="text-sm font-semibold">Transcript</h4>
              <p className="mt-0.5 text-xs text-zinc-500">Receptionist and caller, in chronological order.</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              {orderedMessages.length} message{orderedMessages.length === 1 ? "" : "s"}
            </span>
          </div>
          {orderedMessages.length > 0 ? (
            <div className="mt-4 space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
              {orderedMessages.map((message) => <MessageBubble key={message.id} message={message} />)}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-zinc-300 px-5 py-10 text-center dark:border-zinc-800">
              <MessageSquareText className="mx-auto h-5 w-5 text-zinc-400" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">No transcript available</p>
              <p className="mt-1 text-xs text-zinc-400">This call did not include transcript messages.</p>
            </div>
          )}
        </section>

        <section aria-labelledby="internal-note-heading" className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 id="internal-note-heading" className="text-sm font-semibold">Internal team note</h4>
              <p className="mt-0.5 text-xs text-zinc-500">Private CRM context that callers never see.</p>
            </div>
            <span className="min-h-4 text-xs text-emerald-600" aria-live="polite">{noteStatus}</span>
          </div>
          <Label htmlFor="receptionist-internal-note" className="sr-only">Internal team note</Label>
          <Textarea
            id="receptionist-internal-note"
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Add follow-up details, project context, or ownership notes…"
            className="mt-3 min-h-28 resize-y"
            maxLength={5000}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[11px] text-zinc-400">{note.length.toLocaleString()} / 5,000</span>
            <Button size="sm" onClick={onSaveNote} disabled={noteSaving || !noteChanged}>
              {noteSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Save className="h-3.5 w-3.5" aria-hidden="true" />}
              {noteSaving ? "Saving…" : "Save note"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ReceptionistPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [stats, setStats] = useState<ConversationStats>(EMPTY_STATS);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [knownSources, setKnownSources] = useState<string[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [outcome, setOutcome] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailVersion, setDetailVersion] = useState(0);
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteStatus, setNoteStatus] = useState<string | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
      setSelectedId(null);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadConversations() {
      setLoading(true);
      setListError(null);
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (outcome) params.set("outcome", outcome);
      if (source) params.set("source", source);

      try {
        const response = await fetch(`/api/receptionist/conversations?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error(await responseError(response, "Could not load receptionist conversations."));
        const data = await response.json() as ListResponse;
        if (controller.signal.aborted) return;

        setConversations(data.conversations ?? []);
        setStats(data.stats ?? EMPTY_STATS);
        setPagination(data.pagination ?? EMPTY_PAGINATION);
        setAgentName(data.agentName ?? null);
        setLastSyncedAt(data.lastSyncedAt ?? null);
        setKnownSources((current) => {
          const next = new Set(data.sources ?? current);
          for (const conversation of data.conversations ?? []) {
            if (conversation.initiationSource) next.add(conversation.initiationSource);
          }
          return [...next].sort((a, b) => readableLabel(a).localeCompare(readableLabel(b)));
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setListError(error instanceof Error ? error.message : "Could not load receptionist conversations.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadConversations();
    return () => controller.abort();
  }, [outcome, page, refreshVersion, search, source]);

  const syncConversations = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const response = await fetch("/api/receptionist/conversations", { method: "POST" });
      if (!response.ok) throw new Error(await responseError(response, "Could not sync new calls."));
      const data = await response.json() as SyncResponse;
      if (data.sync?.errors) {
        setSyncError(
          `${data.sync.errors} conversation${data.sync.errors === 1 ? "" : "s"} could not be fully archived and will be retried.`,
        );
      }
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Could not sync new calls.");
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    void syncConversations();
  }, [syncConversations]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailError(null);
      setNote("");
      setNoteStatus(null);
      return;
    }

    const controller = new AbortController();
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    setNoteStatus(null);

    async function loadDetail() {
      try {
        const response = await fetch(`/api/receptionist/conversations/${encodeURIComponent(selectedId as string)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error(await responseError(response, "Could not load this conversation."));
        const data = await response.json() as { conversation: ConversationDetail };
        if (controller.signal.aborted) return;
        setDetail(data.conversation);
        setNote(data.conversation.internalNote ?? "");
      } catch (error) {
        if (controller.signal.aborted) return;
        setDetailError(error instanceof Error ? error.message : "Could not load this conversation.");
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    }

    void loadDetail();
    return () => controller.abort();
  }, [detailVersion, selectedId]);

  async function saveNote() {
    if (!selectedId || !detail) return;
    const savingConversationId = selectedId;
    setNoteSaving(true);
    setNoteStatus(null);

    try {
      const response = await fetch(`/api/receptionist/conversations/${encodeURIComponent(selectedId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNote: note }),
      });
      if (!response.ok) throw new Error(await responseError(response, "Could not save this note."));
      const data = await response.json() as { conversation?: ConversationDetail };
      if (selectedIdRef.current !== savingConversationId) return;
      setDetail((current) => current
        ? { ...current, internalNote: data.conversation?.internalNote ?? note }
        : current);
      setNote(data.conversation?.internalNote ?? note);
      setNoteStatus("Saved");
    } catch (error) {
      setNoteStatus(error instanceof Error ? error.message : "Could not save this note.");
    } finally {
      setNoteSaving(false);
    }
  }

  const activeFilters = useMemo(() => Boolean(search || outcome || source), [outcome, search, source]);

  function changeOutcome(value: string) {
    setOutcome(value);
    setPage(1);
    setSelectedId(null);
  }

  function changeSource(value: string) {
    setSource(value);
    setPage(1);
    setSelectedId(null);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    setSelectedId(null);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setOutcome("");
    setSource("");
    setPage(1);
    setSelectedId(null);
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm">
            <Headphones className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">AI Receptionist</h2>
              {agentName && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  {agentName}
                </span>
              )}
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              Review every receptionist call, replay recordings, scan transcripts, and keep follow-up context in one place.
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {lastSyncedAt ? `Last synced ${formatDateTime(lastSyncedAt)}` : "Waiting for the first successful sync"}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => void syncConversations()} disabled={syncing} className="self-start sm:self-auto">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
          {syncing ? "Syncing calls…" : "Sync calls"}
        </Button>
      </header>

      <div aria-live="polite">
        {syncError && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span><strong className="font-semibold">Sync paused.</strong> {syncError} Stored conversations are still available below.</span>
          </div>
        )}
      </div>

      <section aria-label="Receptionist call statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="All conversations"
          value={stats.total.toLocaleString()}
          detail="Stored in the CRM"
          icon={Headphones}
          tone="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300"
        />
        <StatCard
          label="Successful calls"
          value={stats.successful.toLocaleString()}
          detail={stats.total ? `${Math.round((stats.successful / stats.total) * 100)}% success rate` : "No calls scored yet"}
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
        />
        <StatCard
          label="Needs follow-up"
          value={stats.failed.toLocaleString()}
          detail="Unsuccessful outcomes"
          icon={XCircle}
          tone="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300"
        />
        <StatCard
          label="Total talk time"
          value={formatTalkTime(stats.totalSeconds)}
          detail={`Average ${formatDuration(stats.avgDurationSecs)} per call`}
          icon={Timer}
          tone="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300"
        />
      </section>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:grid lg:h-[760px] lg:grid-cols-[minmax(330px,0.8fr)_minmax(0,1.4fr)]">
        <section className={cn("flex min-h-[560px] flex-col border-zinc-200 dark:border-zinc-800 lg:min-h-0 lg:border-r", selectedId && "hidden lg:flex")} aria-labelledby="conversation-list-heading">
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 id="conversation-list-heading" className="text-sm font-semibold">Conversations</h3>
                <p className="mt-0.5 text-xs text-zinc-500">{pagination.total.toLocaleString()} stored call{pagination.total === 1 ? "" : "s"}</p>
              </div>
              {syncing && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500" role="status">
                  <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Checking for new calls
                </span>
              )}
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search caller, business, or summary…"
                className="pl-9"
                aria-label="Search receptionist conversations"
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Label htmlFor="receptionist-outcome-filter" className="sr-only">Filter by call outcome</Label>
              <Select id="receptionist-outcome-filter" value={outcome} onChange={(event) => changeOutcome(event.target.value)} aria-label="Filter by call outcome">
                <option value="">All outcomes</option>
                <option value="successful">Successful</option>
                <option value="failed">Needs follow-up</option>
              </Select>
              <Label htmlFor="receptionist-source-filter" className="sr-only">Filter by call source</Label>
              <Select id="receptionist-source-filter" value={source} onChange={(event) => changeSource(event.target.value)} aria-label="Filter by call source">
                <option value="">All sources</option>
                {knownSources.map((item) => <option key={item} value={item}>{readableLabel(item)}</option>)}
              </Select>
            </div>
          </div>

          <div className="min-h-0 flex-1 lg:overflow-y-auto">
            {loading ? (
              <ConversationListSkeleton />
            ) : listError ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center" role="alert">
                <AlertCircle className="h-7 w-7 text-rose-500" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold">Couldn&apos;t load conversations</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{listError}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setRefreshVersion((version) => version + 1)}>Try again</Button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900">
                  {activeFilters ? <Search className="h-5 w-5" aria-hidden="true" /> : <Phone className="h-5 w-5" aria-hidden="true" />}
                </span>
                <p className="mt-3 text-sm font-semibold">{activeFilters ? "No matching conversations" : "No receptionist calls yet"}</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">
                  {activeFilters ? "Try a broader search or clear your filters." : "New calls will be archived here after the receptionist syncs."}
                </p>
                {activeFilters ? (
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Clear filters</Button>
                ) : (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => void syncConversations()} disabled={syncing}>Sync now</Button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 p-3 sm:p-4">
                {conversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    selected={selectedId === conversation.id}
                    onSelect={() => setSelectedId(conversation.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {!loading && !listError && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => changePage(Math.max(1, page - 1))}
                  disabled={pagination.page <= 1}
                  aria-label="Previous conversations page"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => changePage(Math.min(pagination.pages, page + 1))}
                  disabled={pagination.page >= pagination.pages}
                  aria-label="Next conversations page"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className={cn("min-w-0", !selectedId && "hidden lg:block")} aria-label="Conversation details">
          <ConversationDetailPanel
            conversation={detail}
            loading={detailLoading}
            error={detailError}
            note={note}
            noteSaving={noteSaving}
            noteStatus={noteStatus}
            onNoteChange={(value) => {
              setNote(value);
              setNoteStatus(null);
            }}
            onSaveNote={() => void saveNote()}
            onRetry={() => setDetailVersion((version) => version + 1)}
            onBack={() => setSelectedId(null)}
          />
        </section>
      </div>
    </div>
  );
}
