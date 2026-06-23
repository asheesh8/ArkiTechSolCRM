"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CsvImportCard } from "@/components/crm/csv-import-card";
import { LeadTable } from "@/components/crm/lead-table";
import { ManualClientForm } from "@/components/crm/manual-client-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { leadPriorities, leadStatuses } from "@/lib/schemas";
import { formatStatus } from "@/lib/utils";

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "";
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: initialStatus, priority: "", city: "", category: "" });

  useEffect(() => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    setLoading(true);
    fetch(`/api/leads?${params}`).then((res) => res.json()).then((data) => setLeads(data.leads ?? [])).finally(() => setLoading(false));
  }, [filters]);

  async function updateStatus(id: string, status: string) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function updatePriority(id: string, priority: string) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, priority } : lead)));
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priority }) });
  }

  function addCreatedLead(lead: any) {
    setLeads((current) => [lead, ...current]);
    setFilters((current) => ({ ...current, status: "" }));
  }

  function addImportedLeads(importedLeads: any[]) {
    setLeads((current) => [...importedLeads, ...current]);
    setFilters((current) => ({ ...current, status: "" }));
  }

  const priorityLeads = leads.filter((lead) => ["FAVORITE", "PRIORITY"].includes(lead.priority)).slice(0, 6);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">CRM Clients</h2>
        <p className="mt-1 text-sm text-zinc-500">Saved leads, call states, owners, website strength, and review signals.</p>
      </section>

      <ManualClientForm onCreated={addCreatedLead} />
      <CsvImportCard onImported={addImportedLeads} />

      <Card>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-5">
          <Input placeholder="Search business, phone, website" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            {leadStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
          </Select>
          <Select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All priorities</option>
            {leadPriorities.map((priority) => <option key={priority} value={priority}>{formatStatus(priority)}</option>)}
          </Select>
          <Input placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
          <Input placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        </CardContent>
      </Card>

      {!loading && priorityLeads.length ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <h3 className="font-semibold">Priority Clients</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {priorityLeads.map((lead) => (
              <Link key={lead.id} href={`/clients/${lead.id}`} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{lead.businessName}</p>
                    <p className="mt-1 text-xs text-zinc-500">{[lead.city, lead.state].filter(Boolean).join(", ") || "No location"}</p>
                  </div>
                  <Badge value={lead.priority ?? "STANDARD"} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{lead.category ?? "Uncategorized"}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {loading ? <div className="h-80 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" /> : <LeadTable leads={leads} onStatus={updateStatus} onPriority={updatePriority} />}
    </div>
  );
}
