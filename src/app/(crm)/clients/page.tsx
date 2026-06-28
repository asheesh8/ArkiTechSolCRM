"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Filter, Plus, Search, Star, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LeadTable } from "@/components/crm/lead-table";
import { ManualClientForm } from "@/components/crm/manual-client-form";
import { CsvImportCard } from "@/components/crm/csv-import-card";
import { Input } from "@/components/ui/field";
import { cn, formatStatus } from "@/lib/utils";
import { leadStatuses } from "@/lib/schemas";

const STATUS_COLORS: Record<string, string> = {
  NEW:            "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  SAVED:          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  CALLED:         "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  MEETING_BOOKED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  FOLLOW_UP:      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  NOT_INTERESTED: "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  CLOSED:         "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
};

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "";

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [city, setCity] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (city) params.set("city", city);
    setLoading(true);
    fetch(`/api/leads?${params}`)
      .then((r) => r.json())
      .then((d) => setLeads(d.leads ?? []))
      .finally(() => setLoading(false));
  }, [search, status, city]);

  // Fetch counts per status for the pills
  useEffect(() => {
    Promise.all(
      leadStatuses.map((s) =>
        fetch(`/api/leads?status=${s}`).then((r) => r.json()).then((d) => [s, d.leads?.length ?? 0])
      )
    ).then((results) => setCounts(Object.fromEntries(results)));
  }, []);

  async function updateStatus(id: string, newStatus: string) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function addLead(lead: any) {
    setLeads((prev) => [lead, ...prev]);
    setShowAdd(false);
    setStatus("");
  }

  function addImported(imported: any[]) {
    setLeads((prev) => [...imported, ...prev]);
    setShowImport(false);
    setStatus("");
  }

  const priorityLeads = leads.filter((l) => ["FAVORITE", "PRIORITY"].includes(l.priority)).slice(0, 4);
  const hasFilters = search || status || city;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">CRM Clients</h2>
          <p className="mt-1 text-sm text-zinc-500">{leads.length} leads{status ? ` in ${formatStatus(status)}` : ""} · click a stage pill to filter</p>
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

      {/* ── Status filter pills ── */}
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
          All <span className="ml-1 opacity-60">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
        </button>
        {leadStatuses.map((s) => (
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

      {/* ── Search + city ── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search business name, phone, website…"
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

      {/* ── Priority spotlight ── */}
      {!hasFilters && !loading && priorityLeads.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <h3 className="text-sm font-semibold">Priority leads</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {priorityLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/clients/${lead.id}`}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-tight">{lead.businessName}</p>
                  <Badge value={lead.priority ?? "STANDARD"} />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{lead.category ?? "Uncategorized"}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{[lead.city, lead.state].filter(Boolean).join(", ") || "No location"}</span>
                  <Badge value={lead.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Lead list ── */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />)}
        </div>
      ) : (
        <LeadTable leads={leads} onStatus={updateStatus} />
      )}
    </div>
  );
}
