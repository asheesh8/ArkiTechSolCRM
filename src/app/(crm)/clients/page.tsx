"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Building2, ChevronDown, ChevronRight, ClipboardList, Filter, Loader2, MapPin, Phone, Plus, Search, Star, UserCheck, UserPlus, Users, X } from "lucide-react";
import { LeadTable } from "@/components/crm/lead-table";
import { ManualClientForm } from "@/components/crm/manual-client-form";
import { CsvImportCard } from "@/components/crm/csv-import-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
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

function ActiveClientCard({ lead }: { lead: any }) {
  const location = [lead.city, lead.state].filter(Boolean).join(", ");
  const isPriority = ["FAVORITE", "PRIORITY"].includes(lead.priority);
  return (
    <Link
      href={`/clients/${lead.id}`}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-950",
        isPriority ? "border-amber-200 dark:border-amber-800" : "border-zinc-200 dark:border-zinc-800",
      )}
    >
      {isPriority && (
        <span className="absolute right-4 top-4"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /></span>
      )}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
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
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-950 dark:text-violet-300">
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

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "leads" ? "leads" : "clients";

  const [tab, setTab] = useState<"clients" | "leads">(initialTab);
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
  }, []);

  function switchTab(t: "clients" | "leads") {
    setTab(t);
    setSearch(""); setStatus(""); setCity("");
    setSelected(new Set());
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
  const byText = (l: any) =>
    (!search || l.businessName?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search) || l.city?.toLowerCase().includes(search.toLowerCase())) &&
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

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of PIPELINE_STATUSES) c[s] = scopedPipeline.filter((l) => l.status === s).length;
    return c;
  }, [scopedPipeline]);

  const featuredClients = filteredClients.filter((l) => ["FAVORITE", "PRIORITY"].includes(l.priority));
  const regularClients = filteredClients.filter((l) => !["FAVORITE", "PRIORITY"].includes(l.priority));
  const hasFilters = !!(search || status || city || assigneeFilter);
  const [staleCutoff] = useState(() => Date.now() - 3 * 24 * 60 * 60 * 1000);
  const staleLeads = useMemo(() => {
    return scopedPipeline
      .filter((lead) => ["SAVED", "CALLED", "FOLLOW_UP"].includes(lead.status))
      .filter((lead) => new Date(lead.updatedAt ?? lead.createdAt).getTime() < staleCutoff)
      .slice(0, 5);
  }, [scopedPipeline, staleCutoff]);

  const assigneeName = assigneeFilter === "unassigned" ? "Unassigned" : users.find((u) => u.id === assigneeFilter)?.name;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">CRM</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {!isManager
              ? `${pipeline.length} lead${pipeline.length !== 1 ? "s" : ""} assigned to you`
              : tab === "clients"
                ? `${activeClients.length} active client${activeClients.length !== 1 ? "s" : ""}`
                : `${pipeline.length} leads in pipeline`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isManager && users.length > 0 && (
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Select
                value={assigneeFilter}
                onChange={(e) => { setAssigneeFilter(e.target.value); setSelected(new Set()); }}
                className="h-10 w-52 pl-9"
              >
                <option value="">All teammates</option>
                <option value="unassigned">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
          )}
          <button
            type="button"
            onClick={() => { setShowImport((v) => !v); setShowAdd(false); }}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <Plus className="h-4 w-4" /> Import CSV
          </button>
          <button
            type="button"
            onClick={() => { setShowAdd((v) => !v); setShowImport(false); }}
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" /> Add lead
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 sm:w-fit">
        {(["clients", "leads"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-semibold transition",
              tab === t ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
            )}
          >
            {t === "clients" ? (
              <span className="flex items-center gap-2">
                Active Clients
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tab === "clients" ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400")}>{activeClients.length}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Leads
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tab === "leads" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400")}>{pipeline.length}</span>
              </span>
            )}
          </button>
        ))}
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
          <Input placeholder={tab === "clients" ? "Search clients…" : "Search leads…"} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="relative sm:w-48">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Filter by city…" value={city} onChange={(e) => setCity(e.target.value)} className="pl-9" />
        </div>
        {hasFilters && (
          <button type="button" onClick={() => { setSearch(""); setStatus(""); setCity(""); setAssigneeFilter(""); }} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {assigneeName && (
        <p className="flex items-center gap-1.5 text-sm text-zinc-500"><UserCheck className="h-4 w-4 text-zinc-400" />Showing <span className="font-medium text-zinc-700 dark:text-zinc-300">{assigneeName}</span>&apos;s {tab === "clients" ? "clients" : "leads"}.</p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />)}
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
            <div className="rounded-xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
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
                  <Link key={lead.id} href={`/clients/${lead.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{lead.businessName}</p>
                      <p className="text-xs text-zinc-500">{formatStatus(lead.status)} · last touched {new Date(lead.updatedAt ?? lead.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                )) : <p className="rounded-lg border border-dashed border-zinc-300 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700">No stale leads in this view.</p>}
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
                <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">First touch</p>
                  <p className="mt-1 leading-5">I noticed one website opportunity for your business and had a quick idea that could help more people contact you.</p>
                </div>
                <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Follow-up</p>
                  <p className="mt-1 leading-5">Based on what you shared, the clearest next step is a focused plan for timeline, scope, and what changes first.</p>
                </div>
                <Link href="/resources" className="inline-flex text-sm font-medium text-[var(--accent)] hover:underline">Open all templates</Link>
              </CardContent>
            </Card>
          </div>

          {/* Bulk assign bar (managers) */}
          {isManager && selected.size > 0 && (
            <div className="sticky top-[4.5rem] z-10 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-3 backdrop-blur">
              <span className="text-sm font-semibold">{selected.size} selected</span>
              {selected.size < filteredLeads.length && (
                <button type="button" onClick={() => setSelected(new Set(filteredLeads.map((l) => l.id)))} className="text-xs font-medium text-[var(--accent)] underline">
                  Select all {filteredLeads.length}
                </button>
              )}
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Select value={bulkAssignee} onChange={(e) => setBulkAssignee(e.target.value)} className="h-9 w-44 py-0 text-sm">
                  <option value="">Assign to…</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  <option value="__unassign__">Unassign</option>
                </Select>
                <Button size="sm" onClick={bulkAssign} disabled={bulkBusy || !bulkAssignee}>
                  {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}Assign
                </Button>
                <button type="button" onClick={() => setSelected(new Set())} className="rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">Clear</button>
              </div>
            </div>
          )}
          {bulkMsg && <p className="text-sm text-emerald-600 dark:text-emerald-400">{bulkMsg}</p>}

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setStatus("")} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", !status ? "border-zinc-400 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400")}>
              All <span className="ml-1 opacity-60">{scopedPipeline.length}</span>
            </button>
            {PIPELINE_STATUSES.map((s) => (
              <button key={s} type="button" onClick={() => setStatus(status === s ? "" : s)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", status === s ? STATUS_COLORS[s] : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400")}>
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
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button type="button" onClick={() => setShowDead((v) => !v)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
                {showDead ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Not interested</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">{filteredDead.length}</span>
                <span className="ml-auto text-xs text-zinc-400">Kept out of the active list</span>
              </button>
              {showDead && (
                <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
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
