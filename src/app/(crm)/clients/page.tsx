"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CsvImportCard } from "@/components/crm/csv-import-card";
import { LeadTable } from "@/components/crm/lead-table";
import { ManualClientForm } from "@/components/crm/manual-client-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { leadStatuses } from "@/lib/schemas";
import { formatStatus } from "@/lib/utils";

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "";
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: initialStatus, city: "", category: "" });

  useEffect(() => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    setLoading(true);
    fetch(`/api/leads?${params}`).then((res) => res.json()).then((data) => setLeads(data.leads ?? [])).finally(() => setLoading(false));
  }, [filters]);

  async function updateStatus(id: string, status: string) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  function addCreatedLead(lead: any) {
    setLeads((current) => [lead, ...current]);
    setFilters((current) => ({ ...current, status: "" }));
  }

  function addImportedLeads(importedLeads: any[]) {
    setLeads((current) => [...importedLeads, ...current]);
    setFilters((current) => ({ ...current, status: "" }));
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">CRM Clients</h2>
        <p className="mt-1 text-sm text-zinc-500">Saved leads, call states, owners, website strength, and review signals.</p>
      </section>

      <ManualClientForm onCreated={addCreatedLead} />
      <CsvImportCard onImported={addImportedLeads} />

      <Card>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-4">
          <Input placeholder="Search business, phone, website" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            {leadStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
          </Select>
          <Input placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
          <Input placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        </CardContent>
      </Card>

      {loading ? <div className="h-80 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" /> : <LeadTable leads={leads} onStatus={updateStatus} />}
    </div>
  );
}
