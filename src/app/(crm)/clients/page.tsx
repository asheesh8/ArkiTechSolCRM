"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, Filter, MapPin, Phone, Plus, Search, Star, UserPlus, X } from "lucide-react";
import { LeadTable } from "@/components/crm/lead-table";
import { ManualClientForm } from "@/components/crm/manual-client-form";
import { CsvImportCard } from "@/components/crm/csv-import-card";
import { Input } from "@/components/ui/field";
import { cn, formatStatus } from "@/lib/utils";
import { leadStatuses } from "@/lib/schemas";

const LEAD_STATUSES = leadStatuses.filter((s) => s !== "CLOSED");

const STATUS_COLORS: Record<string, string> = {
  NEW:            "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  SAVED:          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  CALLED:         "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  MEETING_BOOKED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  FOLLOW_UP:      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  NOT_INTERESTED: "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  CLOSED:         "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
};

function ActiveClientCard({ lead }: { lead: any }) {
  const location = [lead.city, lead.state].filter(Boolean).join(", ");
  const isPriority = ["FAVORITE", "PRIORITY"].includes(lead.priority);
  return (
    <Link
      href={`/clients/${lead.id}`}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-950",
        isPriority
          ? "border-amber-200 dark:border-amber-800"
          : "border-zinc-200 dark:border-zinc-800",
      )}
    >
      {isPriority && (
        <span className="absolute right-4 top-4">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        </span>
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
        {location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            {location}
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            {lead.phone}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          Active client
        </span>
        {lead.callNotes?.[0]?.createdAt && (
          <span className="text-[10px] text-zinc-400">
            Last contact {new Date(lead.callNotes[0].createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") === "leads" ? "leads" : "clients";

  const [tab, setTab] = useState<"clients" | "leads">(initialTab);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setLoading(true);
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setAllLeads(d.leads ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const c: Record<string, number> = {};
    for (const s of leadStatuses) c[s] = allLeads.filter((l) => l.status === s).length;
    setCounts(c);
  }, [allLeads]);

  function switchTab(t: "clients" | "leads") {
    setTab(t);
    setSearch("");
    setStatus("");
    setCity("");
  }

  async function updateStatus(id: string, newStatus: string) {
    setAllLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function addLead(lead: any) {
    setAllLeads((prev) => [lead, ...prev]);
    setShowAdd(false);
  }

  function addImported(imported: any[]) {
    setAllLeads((prev) => [...imported, ...prev]);
    setShowImport(false);
  }

  // Split into active clients (CLOSED) and leads (everything else)
  const activeClients = allLeads.filter((l) => l.status === "CLOSED");
  const coldLeads = allLeads.filter((l) => l.status !== "CLOSED");

  // Filter active clients
  const filteredClients = activeClients.filter((l) => {
    if (search && !l.businessName?.toLowerCase().includes(search.toLowerCase()) &&
        !l.phone?.includes(search) && !l.city?.toLowerCase().includes(search.toLowerCase())) return false;
    if (city && !l.city?.toLowerCase().includes(city.toLowerCase())) return false;
    return true;
  });

  // Filter leads
  const filteredLeads = coldLeads.filter((l) => {
    if (search && !l.businessName?.toLowerCase().includes(search.toLowerCase()) &&
        !l.phone?.includes(search) && !l.city?.toLowerCase().includes(search.toLowerCase())) return false;
    if (status && l.status !== status) return false;
    if (city && !l.city?.toLowerCase().includes(city.toLowerCase())) return false;
    return true;
  });

  // Featured: priority/favorite clients
  const featuredClients = filteredClients.filter((l) => ["FAVORITE", "PRIORITY"].includes(l.priority));
  const regularClients = filteredClients.filter((l) => !["FAVORITE", "PRIORITY"].includes(l.priority));
  const hasFilters = search || status || city;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">CRM</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {tab === "clients"
              ? `${activeClients.length} active client${activeClients.length !== 1 ? "s" : ""}`
              : `${coldLeads.length} leads in pipeline`}
          </p>
        </div>
        <div className="flex gap-2">
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
              tab === t
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
            )}
          >
            {t === "clients" ? (
              <span className="flex items-center gap-2">
                Active Clients
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  tab === "clients" ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                )}>{activeClients.length}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Leads
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  tab === "leads" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                )}>{coldLeads.length}</span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Add / Import panels ── */}
      {showAdd && (
        <div className="relative">
          <button type="button" onClick={() => setShowAdd(false)} className="absolute right-4 top-4 z-10 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-4 w-4" /></button>
          <ManualClientForm onCreated={addLead} />
        </div>
      )}
      {showImport && (
        <div className="relative">
          <button type="button" onClick={() => setShowImport(false)} className="absolute right-4 top-4 z-10 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-4 w-4" /></button>
          <CsvImportCard onImported={addImported} />
        </div>
      )}

      {/* ── Search + city ── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder={tab === "clients" ? "Search clients…" : "Search leads…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Filter by city…"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => { setSearch(""); setStatus(""); setCity(""); }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />)}
        </div>
      ) : tab === "clients" ? (

        /* ══════════ ACTIVE CLIENTS TAB ══════════ */
        <div className="space-y-8">

          {/* Featured (priority/favorite) */}
          {!hasFilters && featuredClients.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <h3 className="text-sm font-semibold">Priority & favorites</h3>
                <span className="text-xs text-zinc-400">{featuredClients.length}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredClients.map((lead) => <ActiveClientCard key={lead.id} lead={lead} />)}
              </div>
            </div>
          )}

          {/* All active clients */}
          {filteredClients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
              <p className="font-semibold text-zinc-500">No active clients yet</p>
              <p className="mt-1 text-sm text-zinc-400">Mark a lead as Closed to move them here.</p>
            </div>
          ) : (
            <div>
              {(hasFilters ? filteredClients : regularClients).length > 0 && (
                <>
                  {!hasFilters && featuredClients.length > 0 && (
                    <h3 className="mb-4 text-sm font-semibold text-zinc-500">All clients</h3>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {(hasFilters ? filteredClients : regularClients).map((lead) => (
                      <ActiveClientCard key={lead.id} lead={lead} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      ) : (

        /* ══════════ LEADS TAB ══════════ */
        <div className="space-y-5">

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatus("")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                !status
                  ? "border-zinc-400 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
              )}
            >
              All <span className="ml-1 opacity-60">{coldLeads.length}</span>
            </button>
            {LEAD_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(status === s ? "" : s)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  status === s
                    ? STATUS_COLORS[s]
                    : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
                )}
              >
                {formatStatus(s)}
                {counts[s] != null && <span className="ml-1.5 opacity-60">{counts[s]}</span>}
              </button>
            ))}
          </div>

          <LeadTable leads={filteredLeads} onStatus={updateStatus} />
        </div>
      )}
    </div>
  );
}
