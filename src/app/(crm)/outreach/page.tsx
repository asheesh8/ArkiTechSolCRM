"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCheck, Copy, MapPin, MessageSquare, Phone, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { checkPhone, fillTemplate, smsLink, type PhoneCheck } from "@/lib/phone";

type Lead = {
  id: string;
  businessName: string;
  category?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
};

const DEFAULT_TEMPLATE =
  "Hey {name}, this is Ashish with ArkiTech. I've got 5-10 clients lined up for this coming month that need your kind of work — would you have the capacity to take some on? Happy to share details.";

const STATUS_STYLE: Record<PhoneCheck["status"], string> = {
  valid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  suspicious: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  invalid: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

export default function OutreachPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  // Per-lead overrides for custom (non-mass) texts. Keyed by lead id.
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => {
        setLeads(data.leads ?? []);
        setDemo(!!data.demo);
      })
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, []);

  // Annotate every lead with its phone check once.
  const annotated = useMemo(
    () => leads.map((lead) => ({ lead, check: checkPhone(lead.phone) })),
    [leads],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return annotated;
    return annotated.filter(({ lead }) =>
      [lead.businessName, lead.category, lead.city, lead.state, lead.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [annotated, query]);

  const textableInView = filtered.filter(({ check }) => check.textable);
  const selectedRows = annotated.filter(({ lead }) => selected.has(lead.id));

  const counts = useMemo(() => {
    let valid = 0, suspicious = 0, invalid = 0;
    for (const { check } of annotated) {
      if (check.status === "valid") valid++;
      else if (check.status === "suspicious") suspicious++;
      else invalid++;
    }
    return { valid, suspicious, invalid, total: annotated.length };
  }, [annotated]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAllTextable() {
    setSelected(new Set(textableInView.map(({ lead }) => lead.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function messageFor(lead: Lead) {
    const base = overrides[lead.id] ?? template;
    return fillTemplate(base, lead);
  }

  async function copyMessage(lead: Lead) {
    try {
      await navigator.clipboard.writeText(messageFor(lead));
      setCopiedId(lead.id);
      setTimeout(() => setCopiedId((c) => (c === lead.id ? null : c)), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  function markSent(id: string) {
    setSentIds((prev) => new Set(prev).add(id));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Cold Text Outreach</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Pick leads, we validate every phone, then tap to open each text pre-filled in your Messages app.
          {demo && <span className="ml-1 font-medium text-amber-600">Showing demo leads.</span>}
        </p>
      </div>

      {/* Message composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Mass message template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="min-h-28"
            placeholder="Write your cold text…"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>Tokens:</span>
            {["{name}", "{business}", "{city}", "{state}"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTemplate((v) => `${v}${v.endsWith(" ") || !v ? "" : " "}${t}`)}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[11px] hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {t}
              </button>
            ))}
            <span className="ml-auto">{template.length} chars</span>
          </div>
        </CardContent>
      </Card>

      {/* Phone health summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total leads" value={counts.total} />
        <SummaryStat label="Valid" value={counts.valid} tone="text-emerald-600" />
        <SummaryStat label="Flagged" value={counts.suspicious} tone="text-amber-600" />
        <SummaryStat label="Unusable" value={counts.invalid} tone="text-red-600" />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, city, phone…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAllTextable}>
            Select all textable ({textableInView.length})
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSelection} disabled={!selected.size}>
            Clear
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-16 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-3">
          <p className="text-sm font-medium">
            {selected.size} selected · {selectedRows.filter(({ check }) => check.textable).length} textable
          </p>
          <p className="text-xs text-zinc-500">Tap “Text” on each below to send from your phone</p>
        </div>
      )}

      {/* Lead list */}
      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-500">Loading leads…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <p className="font-semibold text-zinc-600 dark:text-zinc-400">No leads match</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(({ lead, check }) => {
            const isSelected = selected.has(lead.id);
            const isSent = sentIds.has(lead.id);
            const msg = messageFor(lead);
            return (
              <div
                key={lead.id}
                className={`rounded-xl border bg-white transition dark:bg-zinc-950 ${
                  isSelected
                    ? "border-[var(--accent)] shadow-sm"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(lead.id)}
                    disabled={!check.textable}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)] disabled:opacity-30"
                    aria-label={`Select ${lead.businessName}`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{lead.businessName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLE[check.status]}`}>
                        {check.status === "valid" ? "Textable" : check.status === "suspicious" ? "Flagged" : "No number"}
                      </span>
                      {isSent && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <CheckCheck className="h-3.5 w-3.5" /> Texted
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      {lead.category && <span>{lead.category}</span>}
                      {(lead.city || lead.state) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[lead.city, lead.state].filter(Boolean).join(", ")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {check.national ?? lead.phone ?? "—"}
                      </span>
                      {check.status !== "valid" && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          {check.reason}
                        </span>
                      )}
                    </div>

                    {isSelected && check.textable && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-xs text-zinc-500">Message preview (edit to customize this one)</Label>
                        <Textarea
                          value={msg}
                          onChange={(e) => setOverrides((o) => ({ ...o, [lead.id]: e.target.value }))}
                          className="min-h-20 text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {check.textable && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyMessage(lead)}>
                        {copiedId === lead.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        Copy
                      </Button>
                      <a href={smsLink(check.e164!, msg)} onClick={() => markSent(lead.id)}>
                        <Button size="sm">
                          <Send className="h-3.5 w-3.5" /> Text
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-0.5 text-2xl font-semibold ${tone ?? ""}`}>{value}</p>
    </div>
  );
}
