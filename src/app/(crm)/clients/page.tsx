"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Building2, ChevronDown, ChevronRight, ClipboardList, Download, Filter, KeyRound, Loader2, Mail, MapPin, Phone, Plus, Search, Star, Trash2, UserCheck, UserPlus, Users, X } from "lucide-react";
import { LeadTable } from "@/components/crm/lead-table";
import { ManualClientForm } from "@/components/crm/manual-client-form";
import { CsvImportCard } from "@/components/crm/csv-import-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { MetricTile } from "@/components/crm/metric-tile";
import { PageHeader } from "@/components/crm/page-header";
import { buildLeadExportCsv } from "@/lib/lead-export";
import { matchesPhoneSearch } from "@/lib/phone";
import { cn, formatStatus } from "@/lib/utils";
import { leadStatuses } from "@/lib/schemas";

// Active pipeline only — Closed (won clients) and Not interested get their
// own areas so the working list stays clean.
const PIPELINE_STATUSES = leadStatuses.filter((s) => s !== "CLOSED" && s !== "NOT_INTERESTED");

const STATUS_COLORS: Record<string, string> = {
  NEW:            "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  SAVED:          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  CALLED:         "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  MEETING_BOOKED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  FOLLOW_UP:      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  NOT_INTERESTED: "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  CLOSED:         "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
};

type TeamUser = { id: string; name: string; role: string };

type OnboardedClient = {
  id: string;
  leadId: string | null;
  name: string;
  email: string;
  phone: string | null;
  businessName: string;
  createdAt: string;
  portalStatus: "ACTIVE" | "INVITED" | "NONE";
  _count: { contracts: number; invoices: number; workRequests: number };
};

const PORTAL_TONE: Record<OnboardedClient["portalStatus"], string> = {
  ACTIVE:  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  INVITED: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  NONE:    "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
};

const PORTAL_LABEL: Record<OnboardedClient["portalStatus"], string> = {
  ACTIVE:  "Login active",
  INVITED: "Invite pending",
  NONE:    "No login",
};

// Onboarded clients are Client records with a portal login — distinct from the
// Closed leads shown in the Active Clients tab. This is where broken or
// duplicate onboardings get cleaned up.
function OnboardedRow({ client, canManage, onChanged, onDeleted }: {
  client: OnboardedClient;
  canManage: boolean;
  onChanged: (id: string, patch: Partial<OnboardedClient>) => void;
  onDeleted: (id: string) => void;
}) {
  const [busy, setBusy] = useState<"invite" | "login" | "delete" | "">("");
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const counts = client._count;

  async function sendInvite() {
    setBusy("invite"); setMsg("");
    try {
      const res = await fetch(`/api/clients/${client.id}/login`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(data.error ?? "Could not send the invite."); return; }
      onChanged(client.id, { portalStatus: "INVITED" });
      setMsg(`Setup link emailed to ${client.email}.`);
    } catch {
      setMsg("Network error — nothing was sent.");
    } finally { setBusy(""); }
  }

  async function removeLogin() {
    setBusy("login"); setMsg("");
    try {
      const res = await fetch(`/api/clients/${client.id}/login`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(data.error ?? "Could not reset the login."); return; }
      onChanged(client.id, { portalStatus: "NONE" });
      setMsg("Portal login removed. Send a new invite when they're ready.");
    } catch {
      setMsg("Network error — the login was not changed.");
    } finally { setBusy(""); }
  }

  async function deleteClient() {
    setBusy("delete"); setMsg("");
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(data.error ?? "Could not delete this client."); setBusy(""); return; }
      onDeleted(client.id);
    } catch {
      setMsg("Network error — nothing was deleted.");
      setBusy("");
    }
  }

  return (
    <div className="crm-card rounded-lg border border-[var(--border)] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{client.businessName}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", PORTAL_TONE[client.portalStatus])}>
              {PORTAL_LABEL[client.portalStatus]}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-zinc-500">{client.name} · {client.email}{client.phone ? ` · ${client.phone}` : ""}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {counts.contracts} contract{counts.contracts === 1 ? "" : "s"} · {counts.invoices} invoice{counts.invoices === 1 ? "" : "s"} · {counts.workRequests} request{counts.workRequests === 1 ? "" : "s"} · onboarded {new Date(client.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {client.leadId && (
            <Link href={`/clients/${client.leadId}`}>
              <Button variant="outline" size="sm">Open profile</Button>
            </Link>
          )}
          {canManage && (
            <>
              <Button variant="outline" size="sm" disabled={!!busy} onClick={sendInvite}>
                {busy === "invite" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {client.portalStatus === "NONE" ? "Send invite" : "Resend invite"}
              </Button>
              <Button variant="outline" size="sm" disabled={!!busy || client.portalStatus === "NONE"} onClick={removeLogin}>
                {busy === "login" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Remove login
              </Button>
              <Button variant="outline" size="sm" disabled={!!busy} onClick={() => setConfirmDelete((v) => !v)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {confirmDelete && canManage && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">Delete {client.businessName} permanently?</p>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            This also removes {counts.contracts} contract{counts.contracts === 1 ? "" : "s"}, {counts.invoices} invoice{counts.invoices === 1 ? "" : "s"}, and {counts.workRequests} work request{counts.workRequests === 1 ? "" : "s"}. The lead record stays. This cannot be undone.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={!!busy} onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button size="sm" disabled={!!busy} onClick={deleteClient} className="bg-red-600 hover:bg-red-700">
              {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Yes, delete permanently
            </Button>
          </div>
        </div>
      )}

      {msg && <p className="mt-2 text-xs text-zinc-500">{msg}</p>}
    </div>
  );
}

function ActiveClientCard({ lead }: { lead: any }) {
  const location = [lead.city, lead.state].filter(Boolean).join(", ");
  const isPriority = ["FAVORITE", "PRIORITY"].includes(lead.priority);
  return (
    <Link
      href={`/clients/${lead.id}`}
      className={cn(
        "crm-card group relative flex flex-col rounded-lg border p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:hover:bg-white/10",
        isPriority ? "border-amber-300 dark:border-amber-800" : "border-[var(--border)]",
      )}
    >
      {isPriority && (
        <span className="absolute right-4 top-4"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /></span>
      )}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{lead.businessName}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{lead.category ?? "Uncategorized"}</p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-zinc-500">
        {location && <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />{location}</div>}
        {lead.phone && <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0 text-zinc-400" />{lead.phone}</div>}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-700 dark:text-cyan-300">
          Active client
        </span>
        {lead.assignedTo ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400"><UserCheck className="h-3 w-3" />{lead.assignedTo.name}</span>
        ) : lead.callNotes?.[0]?.createdAt ? (
          <span className="text-[10px] text-zinc-400">Last contact {new Date(lead.callNotes[0].createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        ) : null}
      </div>
    </Link>
  );
}

const TABS = ["clients", "leads", "onboarded"] as const;
type Tab = typeof TABS[number];

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "clients";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [onboarded, setOnboarded] = useState<OnboardedClient[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [isManager, setIsManager] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");
  const [showDead, setShowDead] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/leads").then((r) => r.json()).then((d) => setAllLeads(d.leads ?? [])).finally(() => setLoading(false));
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setIsManager(!!d.isManager)).catch(() => setIsManager(false));
    fetch("/api/users").then((r) => r.json()).then((d) => setUsers(d.users ?? [])).catch(() => setUsers([]));
    fetch("/api/clients").then((r) => r.json()).then((d) => setOnboarded(d.clients ?? [])).catch(() => setOnboarded([]));
  }, []);

  function switchTab(t: Tab) {
    setTab(t);
    setSearch(""); setStatus(""); setCity("");
    setSelected(new Set());
  }

  function downloadAllLeads() {
    if (!allLeads.length) return;

    const csv = buildLeadExportCsv(allLeads);
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `arkitech-crm-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function updateStatus(id: string, newStatus: string) {
    const previous = allLeads.find((l) => l.id === id)?.status;
    setAllLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) setAllLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: previous } : l));
    } catch {
      setAllLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: previous } : l));
    }
  }

  async function updateAssignee(id: string, assignedToId: string) {
    const previous = allLeads.find((l) => l.id === id)?.assignedTo ?? null;
    const nextUser = users.find((u) => u.id === assignedToId) ?? null;
    setAllLeads((prev) => prev.map((l) => l.id === id ? { ...l, assignedToId: assignedToId || null, assignedTo: nextUser } : l));
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignedToId: assignedToId || null }),
      });
      if (!res.ok) setAllLeads((prev) => prev.map((l) => l.id === id ? { ...l, assignedToId: previous?.id ?? null, assignedTo: previous } : l));
    } catch {
      setAllLeads((prev) => prev.map((l) => l.id === id ? { ...l, assignedToId: previous?.id ?? null, assignedTo: previous } : l));
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkAssign() {
    if (!bulkAssignee || selected.size === 0) return;
    const ids = [...selected];
    const assignedToId = bulkAssignee === "__unassign__" ? null : bulkAssignee;
    setBulkBusy(true); setBulkMsg("");
    try {
      const res = await fetch("/api/leads/assign", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, assignedToId }),
      });
      const data = await res.json();
      if (!res.ok) { setBulkMsg(data.error ?? "Could not assign."); return; }
      const nextUser = users.find((u) => u.id === assignedToId) ?? null;
      setAllLeads((prev) => prev.map((l) => selected.has(l.id) ? { ...l, assignedToId: assignedToId ?? null, assignedTo: nextUser } : l));
      setBulkMsg(`Assigned ${data.count} lead${data.count === 1 ? "" : "s"} to ${nextUser ? nextUser.name : "no one"}.`);
      setSelected(new Set()); setBulkAssignee("");
    } catch {
      setBulkMsg("Network error — nothing was assigned.");
    } finally {
      setBulkBusy(false);
    }
  }

  // ── Split into won clients / active pipeline / not interested ──
  const normalizedSearch = search.trim().toLowerCase();
  const byText = (l: any) =>
    (!normalizedSearch || l.businessName?.toLowerCase().includes(normalizedSearch) || matchesPhoneSearch(l.phone, search) || l.city?.toLowerCase().includes(normalizedSearch)) &&
    (!city || l.city?.toLowerCase().includes(city.toLowerCase()));
  const byAssignee = (l: any) =>
    !assigneeFilter ? true : assigneeFilter === "unassigned" ? !l.assignedToId : l.assignedToId === assigneeFilter;

  const activeClients = useMemo(() => allLeads.filter((l) => l.status === "CLOSED"), [allLeads]);
  const pipeline = useMemo(() => allLeads.filter((l) => l.status !== "CLOSED" && l.status !== "NOT_INTERESTED"), [allLeads]);
  const dead = useMemo(() => allLeads.filter((l) => l.status === "NOT_INTERESTED"), [allLeads]);

  const filteredClients = activeClients.filter((l) => byText(l) && byAssignee(l));
  const scopedPipeline = pipeline.filter((l) => byText(l) && byAssignee(l));
  const filteredLeads = scopedPipeline.filter((l) => !status || l.status === status);
  const filteredDead = dead.filter((l) => byText(l) && byAssignee(l));

  const filteredOnboarded = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return onboarded;
    return onboarded.filter((c) =>
      c.businessName.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || matchesPhoneSearch(c.phone, search));
  }, [onboarded, search]);

  const counts = (() => {
    const c: Record<string, number> = {};
    for (const s of PIPELINE_STATUSES) c[s] = scopedPipeline.filter((l) => l.status === s).length;
    return c;
  })();

  const featuredClients = filteredClients.filter((l) => ["FAVORITE", "PRIORITY"].includes(l.priority));
  const regularClients = filteredClients.filter((l) => !["FAVORITE", "PRIORITY"].includes(l.priority));
  const hasFilters = !!(search || status || city || assigneeFilter);
  const [staleCutoff] = useState(() => Date.now() - 3 * 24 * 60 * 60 * 1000);
  const staleLeads = scopedPipeline
    .filter((lead) => ["SAVED", "CALLED", "FOLLOW_UP"].includes(lead.status))
    .filter((lead) => new Date(lead.updatedAt ?? lead.createdAt).getTime() < staleCutoff)
    .slice(0, 5);

  const assigneeName = assigneeFilter === "unassigned" ? "Unassigned" : users.find((u) => u.id === assigneeFilter)?.name;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relationship desk"
        title="CRM"
        description={!isManager
          ? `${pipeline.length} lead${pipeline.length !== 1 ? "s" : ""} assigned to you.`
          : "Manage active clients, pipeline stages, teammate ownership, and stale opportunities."}
        actions={(
          <>
          {isManager && users.length > 0 && (
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Select
                value={assigneeFilter}
                onChange={(e) => { setAssigneeFilter(e.target.value); setSelected(new Set()); }}
                className="w-full pl-9 lg:w-52"
              >
                <option value="">All teammates</option>
                <option value="unassigned">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
          )}
          <Button
            type="button"
            onClick={downloadAllLeads}
            disabled={loading || allLeads.length === 0}
            variant="outline"
            title={`Download ${allLeads.length} CRM lead${allLeads.length === 1 ? "" : "s"}`}
          >
            <Download className="h-4 w-4" /> Download CSV
          </Button>
          <Button
            type="button"
            onClick={() => { setShowImport((v) => !v); setShowAdd(false); }}
            variant="outline"
          >
            <Plus className="h-4 w-4" /> Import CSV
          </Button>
          <Button
            type="button"
            onClick={() => { setShowAdd((v) => !v); setShowImport(false); }}
          >
            <UserPlus className="h-4 w-4" /> Add lead
          </Button>
          </>
        )}
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricTile icon={Building2} label="Active clients" value={activeClients.length.toLocaleString()} detail="Closed and currently served." tone="cyan" />
        <MetricTile icon={ClipboardList} label="Pipeline leads" value={pipeline.length.toLocaleString()} detail="Working opportunities." tone="emerald" />
        <MetricTile icon={AlertTriangle} label="Stale leads" value={staleLeads.length.toLocaleString()} detail="Need a fresh touch." tone="amber" />
        <MetricTile icon={Star} label="Priority clients" value={featuredClients.length.toLocaleString()} detail="Favorites and priority accounts." tone="rose" />
      </section>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 sm:w-fit">
        {TABS.map((t) => {
          const meta = {
            clients:   { label: "Active Clients", count: activeClients.length, tone: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300" },
            leads:     { label: "Leads", count: pipeline.length, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
            onboarded: { label: "Onboarded", count: onboarded.length, tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
          }[t];
          return (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition sm:flex-none sm:px-5 sm:py-2",
                tab === t ? "bg-[var(--surface-strong)] text-zinc-900 shadow-sm dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
              )}
            >
              <span className="flex items-center justify-center gap-2">
                {meta.label}
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tab === t ? meta.tone : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400")}>{meta.count}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Add / Import panels ── */}
      {showAdd && (
        <div className="relative">
          <button type="button" onClick={() => setShowAdd(false)} className="absolute right-4 top-4 z-10 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-4 w-4" /></button>
          <ManualClientForm onCreated={(lead: any) => { setAllLeads((prev) => [lead, ...prev]); setShowAdd(false); }} />
        </div>
      )}
      {showImport && (
        <div className="relative">
          <button type="button" onClick={() => setShowImport(false)} className="absolute right-4 top-4 z-10 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-4 w-4" /></button>
          <CsvImportCard onImported={(imported: any[]) => { setAllLeads((prev) => [...imported, ...prev]); setShowImport(false); }} />
        </div>
      )}

      {/* ── Search + city ── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder={tab === "onboarded" ? "Search by name, email, or phone…" : "Search by business, phone, or city…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {tab !== "onboarded" && (
          <div className="relative sm:w-48">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Filter by city…" value={city} onChange={(e) => setCity(e.target.value)} className="pl-9" />
          </div>
        )}
        {hasFilters && (
          <button type="button" onClick={() => { setSearch(""); setStatus(""); setCity(""); setAssigneeFilter(""); }} className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-sm font-semibold text-zinc-500 active:scale-[0.98] hover:bg-white dark:hover:bg-white/10 lg:h-auto lg:py-2">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {assigneeName && (
        <p className="flex items-center gap-1.5 text-sm text-zinc-500"><UserCheck className="h-4 w-4 text-zinc-400" />Showing <span className="font-medium text-zinc-700 dark:text-zinc-300">{assigneeName}</span>&apos;s {tab === "clients" ? "clients" : "leads"}.</p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-zinc-100/80 dark:bg-white/10" />)}
        </div>
      ) : tab === "clients" ? (

        /* ══════════ ACTIVE CLIENTS TAB ══════════ */
        <div className="space-y-8">
          {!hasFilters && featuredClients.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <h3 className="text-sm font-semibold">Priority &amp; favorites</h3>
                <span className="text-xs text-zinc-400">{featuredClients.length}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredClients.map((lead) => <ActiveClientCard key={lead.id} lead={lead} />)}
              </div>
            </div>
          )}

          {filteredClients.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] py-20 text-center">
              <p className="font-semibold text-zinc-500">No active clients{hasFilters ? " match these filters" : " yet"}</p>
              <p className="mt-1 text-sm text-zinc-400">Mark a lead as Closed to move them here.</p>
            </div>
          ) : (
            <div>
              {(hasFilters ? filteredClients : regularClients).length > 0 && (
                <>
                  {!hasFilters && featuredClients.length > 0 && <h3 className="mb-4 text-sm font-semibold text-zinc-500">All clients</h3>}
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {(hasFilters ? filteredClients : regularClients).map((lead) => <ActiveClientCard key={lead.id} lead={lead} />)}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      ) : tab === "onboarded" ? (

        /* ══════════ ONBOARDED CLIENTS TAB ══════════ */
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Onboarded client accounts</p>
            <p className="mt-1 text-sm text-zinc-500">
              Every client record created by the onboarding flow, with its portal login state. Use this to re-send a setup link,
              clear a broken login, or remove a duplicate or test onboarding.
              {!isManager && " Owner access is required to change or delete these."}
            </p>
          </div>

          {filteredOnboarded.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] py-20 text-center">
              <p className="font-semibold text-zinc-500">No onboarded clients{search ? " match this search" : " yet"}</p>
              <p className="mt-1 text-sm text-zinc-400">Run Onboard from a client profile to create one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOnboarded.map((c) => (
                <OnboardedRow
                  key={c.id}
                  client={c}
                  canManage={isManager}
                  onChanged={(id, patch) => setOnboarded((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x))}
                  onDeleted={(id) => setOnboarded((prev) => prev.filter((x) => x.id !== id))}
                />
              ))}
            </div>
          )}
        </div>

      ) : (

        /* ══════════ LEADS TAB ══════════ */
        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <Card className={cn(staleLeads.length ? "border-amber-200 dark:border-amber-900" : "")}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <CardTitle>Stale lead alerts</CardTitle>
                  <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">{staleLeads.length}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {staleLeads.length ? staleLeads.map((lead) => (
                  <Link key={lead.id} href={`/clients/${lead.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm transition hover:bg-white dark:hover:bg-white/10">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{lead.businessName}</p>
                      <p className="text-xs text-zinc-500">{formatStatus(lead.status)} · last touched {new Date(lead.updatedAt ?? lead.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                )) : <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-strong)] py-8 text-center text-sm text-zinc-400">No stale leads in this view.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-zinc-500" />
                  <CardTitle>Sales scripts</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-500">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">First touch</p>
                  <p className="mt-1 leading-5">I noticed one website opportunity for your business and had a quick idea that could help more people contact you.</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Follow-up</p>
                  <p className="mt-1 leading-5">Based on what you shared, the clearest next step is a focused plan for timeline, scope, and what changes first.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk assign bar (managers) */}
          {isManager && selected.size > 0 && (
            <div className="sticky top-2 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[var(--accent)] bg-[var(--accent)]/10 px-3 py-3 backdrop-blur sm:px-4 lg:top-[4.5rem]">
              <span className="text-sm font-semibold">{selected.size} selected</span>
              {selected.size < filteredLeads.length && (
                <button type="button" onClick={() => setSelected(new Set(filteredLeads.map((l) => l.id)))} className="text-xs font-medium text-[var(--accent)] underline">
                  Select all {filteredLeads.length}
                </button>
              )}
              <button type="button" onClick={() => setSelected(new Set())} className="ml-auto rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 lg:hidden">Clear</button>
              <div className="flex w-full items-center gap-2 lg:ml-auto lg:w-auto">
                <Select value={bulkAssignee} onChange={(e) => setBulkAssignee(e.target.value)} className="min-w-0 flex-1 lg:h-9 lg:w-44 lg:flex-none lg:py-0 lg:text-sm">
                  <option value="">Assign to…</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  <option value="__unassign__">Unassign</option>
                </Select>
                <Button size="sm" onClick={bulkAssign} disabled={bulkBusy || !bulkAssignee} className="h-11 shrink-0 lg:h-8">
                  {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}Assign
                </Button>
                <button type="button" onClick={() => setSelected(new Set())} className="hidden rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 lg:block">Clear</button>
              </div>
            </div>
          )}
          {bulkMsg && <p className="text-sm text-emerald-600 dark:text-emerald-400">{bulkMsg}</p>}

          {/* Status filter pills — a swipeable rail on touch, wrapped at lg. */}
          <div className="crm-rail scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
            <button type="button" onClick={() => setStatus("")} className={cn("flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition active:scale-95 lg:h-auto lg:py-1.5 lg:active:scale-100", !status ? "border-zinc-400 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border-[var(--border)] bg-[var(--surface-strong)] text-zinc-500 hover:bg-white dark:text-zinc-400 dark:hover:bg-white/10")}>
              All <span className="ml-1 opacity-60">{scopedPipeline.length}</span>
            </button>
            {PIPELINE_STATUSES.map((s) => (
              <button key={s} type="button" onClick={() => setStatus(status === s ? "" : s)} className={cn("flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition active:scale-95 lg:h-auto lg:py-1.5 lg:active:scale-100", status === s ? STATUS_COLORS[s] : "border-[var(--border)] bg-[var(--surface-strong)] text-zinc-500 hover:bg-white dark:text-zinc-400 dark:hover:bg-white/10")}>
                {formatStatus(s)}{counts[s] != null && <span className="ml-1.5 opacity-60">{counts[s]}</span>}
              </button>
            ))}
          </div>

          <LeadTable
            leads={filteredLeads}
            onStatus={updateStatus}
            users={isManager ? users : undefined}
            onAssign={isManager ? updateAssignee : undefined}
            selectedIds={isManager ? selected : undefined}
            onToggleSelect={isManager ? toggleSelect : undefined}
          />

          {/* Not interested — tucked away in its own collapsible area */}
          {filteredDead.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              <button type="button" onClick={() => setShowDead((v) => !v)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
                {showDead ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Not interested</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">{filteredDead.length}</span>
                <span className="ml-auto text-xs text-zinc-400">Kept out of the active list</span>
              </button>
              {showDead && (
                <div className="border-t border-[var(--border)] p-4">
                  <LeadTable
                    leads={filteredDead}
                    onStatus={updateStatus}
                    users={isManager ? users : undefined}
                    onAssign={isManager ? updateAssignee : undefined}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
