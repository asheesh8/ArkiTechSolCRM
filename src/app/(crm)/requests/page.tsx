"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, ChevronDown, ChevronUp, Clock, Download,
  FileText, Loader2, MessageSquare, Paperclip, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type WorkFile = { id: string; name: string; r2Key: string; size: string; mimeType: string | null };
type WorkRequest = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  staffNote: string | null;
  createdAt: string;
  files: WorkFile[];
  client: { id: string; name: string; businessName: string; email: string };
};

const STATUSES = ["OPEN", "IN_PROGRESS", "REVIEW", "COMPLETED"];
const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  REVIEW: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function FileIcon({ mime }: { mime: string | null }) {
  if (mime?.startsWith("image/")) return <span className="text-lg">🖼️</span>;
  if (mime?.startsWith("video/")) return <span className="text-lg">🎬</span>;
  if (mime === "application/pdf") return <span className="text-lg">📄</span>;
  return <FileText className="h-4 w-4 text-zinc-400" />;
}

function RequestCard({ req, onUpdate }: { req: WorkRequest; onUpdate: (updated: WorkRequest) => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(req.staffNote ?? "");
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  async function updateStatus(status: string) {
    setSavingStatus(true);
    const res = await fetch("/api/crm/work-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: req.id, status }),
    });
    const data = await res.json();
    setSavingStatus(false);
    if (res.ok) onUpdate(data.request);
  }

  async function saveNote() {
    setSaving(true);
    const res = await fetch("/api/crm/work-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: req.id, staffNote: note }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) onUpdate(data.request);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-4 p-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition"
      >
        <div className="mt-0.5">
          {req.status === "COMPLETED"
            ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            : <Clock className="h-5 w-5 text-amber-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{req.title}</p>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLE[req.status])}>
              {req.status.replace("_", " ")}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500">
            <Link href={`/clients/${req.client.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
              {req.client.businessName}
            </Link>
            <span>{req.client.email}</span>
            <span>{new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
            {req.files.length > 0 && (
              <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" />{req.files.length} file{req.files.length !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_300px]">
            {/* Left: description + files */}
            <div className="space-y-5">
              {req.description && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 mb-2">Description</p>
                  <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{req.description}</p>
                </div>
              )}

              {req.files.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 mb-3">
                    Attached files ({req.files.length})
                  </p>
                  <div className="space-y-2">
                    {req.files.map((f) => (
                      <a
                        key={f.id}
                        href={`/api/portal/files/${encodeURIComponent(f.r2Key)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                      >
                        <FileIcon mime={f.mimeType} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{f.name}</p>
                          <p className="text-xs text-zinc-400">{formatSize(Number(f.size))}</p>
                        </div>
                        <Download className="h-4 w-4 shrink-0 text-zinc-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {req.files.length === 0 && !req.description && (
                <p className="text-sm text-zinc-400 italic">No description or files attached.</p>
              )}
            </div>

            {/* Right: status + staff note */}
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 mb-2">Update status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={savingStatus}
                      onClick={() => updateStatus(s)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs font-medium transition",
                        req.status === s
                          ? STATUS_STYLE[s] + " border-current"
                          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
                      )}
                    >
                      {savingStatus && req.status !== s ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 mb-2">
                  <MessageSquare className="inline h-3 w-3 mr-1" />Internal note
                </p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Notes for you and Terri — not visible to the client."
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full"
                  disabled={saving || note === (req.staffNote ?? "")}
                  onClick={saveNote}
                >
                  {saving ? <><Loader2 className="h-3 w-3 animate-spin" />Saving…</> : "Save note"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  function load() {
    setLoading(true);
    fetch("/api/crm/work-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleUpdate(updated: WorkRequest) {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  const filtered = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);
  const counts: Record<string, number> = { ALL: requests.length };
  for (const s of STATUSES) counts[s] = requests.filter((r) => r.status === s).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Work Requests</h2>
          <p className="mt-1 text-sm text-zinc-500">Everything clients have submitted — files, requests, and notes.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {["ALL", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              filter === s
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
            )}
          >
            {s.replace("_", " ")} <span className="ml-1 opacity-60">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <p className="text-zinc-500">No requests {filter !== "ALL" ? `with status "${filter.replace("_", " ")}"` : "yet"}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <RequestCard key={req.id} req={req} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
