"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock, CheckCircle2, ChevronDown, ChevronUp, Clock, Download,
  FileText, GitBranch, Loader2, MessageSquare, Paperclip, RefreshCw,
  Timer, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type TeamUser = { id: string; name: string; email?: string; role: string };
type WorkFile = { id: string; name: string; r2Key: string; size: string; mimeType: string | null };
type WorkRequest = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  requestType: string;
  priority: string;
  estimateHours: number | null;
  actualHours: number | null;
  repositoryUrl: string | null;
  dueDate: string | null;
  staffNote: string | null;
  createdAt: string;
  files: WorkFile[];
  assignedDeveloper: TeamUser | null;
  client: { id: string; name: string; businessName: string; email: string };
};

const STATUSES = ["OPEN", "IN_PROGRESS", "REVIEW", "COMPLETED"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];
const REQUEST_TYPES = ["CLIENT_REQUEST", "BUG_FIX", "CONTENT_UPDATE", "NEW_BUILD", "INTERNAL_TASK"];

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  REVIEW: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

const PRIORITY_STYLE: Record<string, string> = {
  LOW: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  NORMAL: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function RequestCard({ req, users, onUpdate }: { req: WorkRequest; users: TeamUser[]; onUpdate: (updated: WorkRequest) => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState("");
  const [form, setForm] = useState({
    requestType: req.requestType ?? "CLIENT_REQUEST",
    priority: req.priority ?? "NORMAL",
    estimateHours: req.estimateHours?.toString() ?? "",
    actualHours: req.actualHours?.toString() ?? "",
    repositoryUrl: req.repositoryUrl ?? "",
    dueDate: req.dueDate ? req.dueDate.slice(0, 10) : "",
    assignedDeveloperId: req.assignedDeveloper?.id ?? "",
    staffNote: req.staffNote ?? "",
  });

  async function patch(payload: Record<string, unknown>, mode: string) {
    setSaving(mode);
    const res = await fetch("/api/crm/work-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: req.id, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving("");
    if (res.ok) onUpdate(data.request);
  }

  const due = req.dueDate ? new Date(req.dueDate) : null;
  const overdue = due && due < new Date() && req.status !== "COMPLETED";

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
        <div className="mt-0.5">
          {req.status === "COMPLETED" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{req.title}</p>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLE[req.status])}>{label(req.status)}</span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", PRIORITY_STYLE[req.priority] ?? PRIORITY_STYLE.NORMAL)}>{label(req.priority)}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            <Link href={`/clients/${req.client.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
              {req.client.businessName}
            </Link>
            <span>{label(req.requestType)}</span>
            {req.assignedDeveloper && <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" />{req.assignedDeveloper.name}</span>}
            {req.estimateHours != null && <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{req.estimateHours}h est.</span>}
            {due && <span className={cn("flex items-center gap-1", overdue && "font-medium text-red-600")}><CalendarClock className="h-3 w-3" />Due {due.toLocaleDateString()}</span>}
            {req.files.length > 0 && <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" />{req.files.length} file{req.files.length === 1 ? "" : "s"}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {req.repositoryUrl && (
            <a href={req.repositoryUrl} target="_blank" rel="noopener noreferrer" className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" title="Open GitHub repo">
              <GitBranch className="h-4 w-4" />
            </a>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
        </div>
      </button>

      {open && (
        <div className="grid gap-6 border-t border-zinc-200 p-5 dark:border-zinc-800 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {req.description ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Client request</p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">{req.description}</p>
              </div>
            ) : (
              <p className="text-sm italic text-zinc-400">No description attached.</p>
            )}

            {req.files.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Attached files</p>
                <div className="space-y-2">
                  {req.files.map((f) => (
                    <a key={f.id} href={`/api/portal/files/${encodeURIComponent(f.r2Key)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{f.name}</p>
                        <p className="text-xs text-zinc-400">{formatSize(Number(f.size))}</p>
                      </div>
                      <Download className="h-4 w-4 shrink-0 text-zinc-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button key={s} type="button" disabled={!!saving} onClick={() => patch({ status: s }, "status")} className={cn("rounded-md border px-3 py-2 text-xs font-medium transition", req.status === s ? `${STATUS_STYLE[s]} border-current` : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900")}>
                  {saving === "status" && req.status !== s ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : label(s)}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Developer delivery</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Type</Label><Select value={form.requestType} onChange={(e) => setForm((f) => ({ ...f, requestType: e.target.value }))}>{REQUEST_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}</Select></div>
                  <div className="space-y-1.5"><Label>Priority</Label><Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>{PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}</Select></div>
                </div>
                <div className="space-y-1.5"><Label>Assigned developer</Label><Select value={form.assignedDeveloperId} onChange={(e) => setForm((f) => ({ ...f, assignedDeveloperId: e.target.value }))}><option value="">Unassigned</option>{users.filter((u) => u.role === "DEV" || u.role === "OWNER").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Estimate hours</Label><Input type="number" min="0" step="0.25" value={form.estimateHours} onChange={(e) => setForm((f) => ({ ...f, estimateHours: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>Actual hours</Label><Input type="number" min="0" step="0.25" value={form.actualHours} onChange={(e) => setForm((f) => ({ ...f, actualHours: e.target.value }))} /></div>
                </div>
                <div className="space-y-1.5"><Label>Due date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>GitHub repo</Label><Input value={form.repositoryUrl} onChange={(e) => setForm((f) => ({ ...f, repositoryUrl: e.target.value }))} placeholder="https://github.com/org/repo" /></div>
                <Button size="sm" className="w-full" disabled={!!saving} onClick={() => patch(form, "meta")}>
                  {saving === "meta" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />}
                  Save delivery plan
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400"><MessageSquare className="mr-1 inline h-3 w-3" />Internal note</p>
              <Textarea value={form.staffNote} onChange={(e) => setForm((f) => ({ ...f, staffNote: e.target.value }))} rows={4} placeholder="Team notes, blockers, deploy details, client context." />
              <Button size="sm" variant="outline" className="mt-2 w-full" disabled={!!saving} onClick={() => patch({ staffNote: form.staffNote }, "note")}>
                {saving === "note" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save note"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  function load() {
    setLoading(true);
    fetch("/api/crm/work-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    fetch("/api/users").then((r) => r.json()).then((d) => setUsers(d.users ?? [])).catch(() => setUsers([]));
  }, []);

  function handleUpdate(updated: WorkRequest) {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  const counts = useMemo(() => {
    const next: Record<string, number> = { ALL: requests.length };
    for (const s of STATUSES) next[s] = requests.filter((r) => r.status === s).length;
    next.OVERDUE = requests.filter((r) => r.dueDate && new Date(r.dueDate) < new Date() && r.status !== "COMPLETED").length;
    return next;
  }, [requests]);

  const filtered = filter === "ALL"
    ? requests
    : filter === "OVERDUE"
      ? requests.filter((r) => r.dueDate && new Date(r.dueDate) < new Date() && r.status !== "COMPLETED")
      : requests.filter((r) => r.status === filter);

  const activeHours = requests
    .filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED")
    .reduce((sum, r) => sum + Number(r.estimateHours ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Developer Work Board</h2>
          <p className="mt-1 text-sm text-zinc-500">Client requests, repo links, estimates, deadlines, and delivery ownership in one place.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card><CardContent className="pt-5"><p className="text-xs font-medium uppercase text-zinc-400">Open delivery</p><p className="mt-1 text-2xl font-semibold">{counts.OPEN + counts.IN_PROGRESS + counts.REVIEW}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs font-medium uppercase text-zinc-400">Estimated load</p><p className="mt-1 text-2xl font-semibold">{activeHours.toFixed(1)}h</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs font-medium uppercase text-zinc-400">Overdue</p><p className="mt-1 text-2xl font-semibold text-red-600">{counts.OVERDUE}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs font-medium uppercase text-zinc-400">With repos</p><p className="mt-1 text-2xl font-semibold">{requests.filter((r) => r.repositoryUrl).length}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {["ALL", ...STATUSES, "OVERDUE"].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", filter === s ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400")}>
            {label(s)} <span className="ml-1 opacity-60">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-zinc-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <p className="text-zinc-500">No work requests in this view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => <RequestCard key={req.id} req={req} users={users} onUpdate={handleUpdate} />)}
        </div>
      )}
    </div>
  );
}
