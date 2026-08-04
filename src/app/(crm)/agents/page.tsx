"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive, Bot, Check, Copy, ExternalLink, Globe, Loader2, PhoneCall, RefreshCw, Save, Search, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { MetricTile } from "@/components/crm/metric-tile";
import { PageHeader } from "@/components/crm/page-header";
import { cn } from "@/lib/utils";

type Agent = {
  id: string;
  providerAgentId: string;
  name: string;
  slug: string;
  clientId: string | null;
  client: { id: string; businessName: string } | null;
  demoEnabled: boolean;
  demoHeadline: string | null;
  demoSubheadline: string | null;
  demoBusiness: string | null;
  isArchived: boolean;
  lastSyncedAt: string | null;
  callCount: number;
};

type ClientOption = { id: string; businessName: string };

function demoUrl(slug: string) {
  const base = typeof window === "undefined" ? "" : window.location.origin;
  return `${base}/demo/${slug}`;
}

function AgentCard({ agent, clients, onChanged }: {
  agent: Agent;
  clients: ClientOption[];
  onChanged: (agent: Agent) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"toggle" | "save" | "">("");
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    clientId: agent.clientId ?? "",
    slug: agent.slug,
    demoHeadline: agent.demoHeadline ?? "",
    demoSubheadline: agent.demoSubheadline ?? "",
    demoBusiness: agent.demoBusiness ?? "",
  });

  async function patch(body: Record<string, unknown>, which: "toggle" | "save") {
    setBusy(which); setMsg("");
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(data.error ?? "Could not save."); return; }
      onChanged({ ...agent, ...data.agent, callCount: agent.callCount });
      if (which === "save") { setMsg("Saved."); setOpen(false); }
    } catch {
      setMsg("Network error — nothing was saved.");
    } finally { setBusy(""); }
  }

  async function copyDemo() {
    await navigator.clipboard.writeText(demoUrl(agent.slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("crm-card rounded-lg border p-4", agent.isArchived && "opacity-60")}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-300">
              <Bot className="h-4 w-4" />
            </span>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{agent.name}</p>
            {agent.isArchived ? (
              <span className="flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                <Archive className="h-3 w-3" /> Gone from ElevenLabs
              </span>
            ) : agent.demoEnabled ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                <Globe className="h-3 w-3" /> Demo live
              </span>
            ) : (
              <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">Demo off</span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-zinc-500">
            {agent.client ? agent.client.businessName : "Unassigned"} · {agent.callCount} call{agent.callCount === 1 ? "" : "s"} archived
          </p>
          <p className="mt-1 truncate font-mono text-[11px] text-zinc-400">{agent.providerAgentId}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {agent.demoEnabled && (
            <>
              <Button variant="outline" size="sm" onClick={copyDemo}>
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy demo link"}
              </Button>
              <a href={`/demo/${agent.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" /> Open</Button>
              </a>
            </>
          )}
          {!agent.isArchived && (
            <Button
              variant={agent.demoEnabled ? "outline" : "default"}
              size="sm"
              disabled={!!busy}
              onClick={() => patch({ demoEnabled: !agent.demoEnabled }, "toggle")}
            >
              {busy === "toggle" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              {agent.demoEnabled ? "Unpublish demo" : "Publish demo"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-4 w-4" /> : null} {open ? "Close" : "Edit"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}>
                <option value="">Unassigned</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.businessName}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Demo link</Label>
              <div className="flex items-center gap-1">
                <span className="shrink-0 text-xs text-zinc-400">/demo/</span>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Headline <span className="font-normal text-zinc-400">(what the prospect sees first)</span></Label>
            <Input
              value={form.demoHeadline}
              onChange={(e) => setForm((f) => ({ ...f, demoHeadline: e.target.value }))}
              placeholder={`Talk to ${agent.name}`}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div className="space-y-1.5">
              <Label>Subheadline</Label>
              <Textarea
                rows={2}
                value={form.demoSubheadline}
                onChange={(e) => setForm((f) => ({ ...f, demoSubheadline: e.target.value }))}
                placeholder="Ask about hours, pricing, or book an appointment…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Business type</Label>
              <Input
                value={form.demoBusiness}
                onChange={(e) => setForm((f) => ({ ...f, demoBusiness: e.target.value }))}
                placeholder="HVAC, dental, salon…"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={!!busy} onClick={() => patch(form, "save")}>
              {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {msg && <p className="mt-2 text-xs text-zinc-500">{msg}</p>}
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [banner, setBanner] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/agents").then((r) => r.json()).then((d) => setAgents(d.agents ?? [])).catch(() => setAgents([])),
      fetch("/api/clients").then((r) => r.json()).then((d) => setClients(d.clients ?? [])).catch(() => setClients([])),
    ]).finally(() => setLoading(false));
  }, []);

  async function sync() {
    setSyncing(true); setBanner(""); setError("");
    try {
      const res = await fetch("/api/agents", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "The sync failed."); return; }
      const refreshed = await fetch("/api/agents").then((r) => r.json());
      setAgents(refreshed.agents ?? []);
      setBanner(`${data.total} agent${data.total === 1 ? "" : "s"} on ElevenLabs — ${data.added} new, ${data.updated} updated, ${data.archived} archived.`);
    } catch {
      setError("Network error — the roster is unchanged.");
    } finally { setSyncing(false); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) =>
      a.name.toLowerCase().includes(q)
      || a.slug.includes(q)
      || (a.client?.businessName.toLowerCase().includes(q) ?? false));
  }, [agents, search]);

  const live = agents.filter((a) => a.demoEnabled && !a.isArchived).length;
  const assigned = agents.filter((a) => a.clientId).length;
  const totalCalls = agents.reduce((sum, a) => sum + a.callCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Voice"
        title="Agents"
        description="Every AI receptionist on the ElevenLabs account. Assign an agent to a client, or publish a demo link a prospect can talk to."
        actions={(
          <Button onClick={sync} disabled={syncing}>
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {syncing ? "Syncing…" : "Sync from ElevenLabs"}
          </Button>
        )}
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricTile icon={Bot} label="Agents" value={agents.length.toLocaleString()} detail="On the account." tone="cyan" />
        <MetricTile icon={Globe} label="Live demos" value={live.toLocaleString()} detail="Publicly reachable." tone="emerald" />
        <MetricTile icon={Users} label="Assigned" value={assigned.toLocaleString()} detail="Mapped to a client." tone="amber" />
        <MetricTile icon={PhoneCall} label="Calls archived" value={totalCalls.toLocaleString()} detail="Across all agents." tone="rose" />
      </section>

      {banner && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">{banner}</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input placeholder="Search agents…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-zinc-100/80 dark:bg-white/10" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="font-semibold text-zinc-500">{agents.length === 0 ? "No agents yet" : "No agents match this search"}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-zinc-400">
              {agents.length === 0
                ? "Build an agent in the ElevenLabs dashboard, then sync to pull it in here."
                : "Try a different name, client, or demo link."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              clients={clients}
              onChanged={(next) => setAgents((prev) => prev.map((a) => a.id === next.id ? next : a))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
