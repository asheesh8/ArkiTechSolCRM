"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ExternalLink, Mail, Megaphone, MousePointerClick, Phone, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MetricTile } from "@/components/crm/metric-tile";
import { PageHeader } from "@/components/crm/page-header";
import { Button } from "@/components/ui/button";

type CampaignLead = {
  id: string;
  businessName: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  assignedTo: { id: string; name: string } | null;
};

type Payload = {
  days: number;
  totals: {
    leadsAllTime: number;
    leadsInWindow: number;
    views: number;
    uniqueVisitors: number;
    demoSessions: number;
    conversionRate: number;
  };
  creatives: Array<{ label: string; count: number }>;
  leads: CampaignLead[];
};

const STATUS_TONES: Record<string, string> = {
  NEW: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  CALLED: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  MEETING_BOOKED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  FOLLOW_UP: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  NOT_INTERESTED: "bg-zinc-500/10 text-zinc-500",
  CLOSED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  SAVED: "bg-zinc-500/10 text-zinc-500",
};

// The landing page writes a structured block into `notes`; these pull the two
// fields worth surfacing in the list back out of it.
function noteField(notes: string | null, label: string) {
  const match = notes?.match(new RegExp(`^${label}: (.+)$`, "m"));
  return match?.[1]?.trim() ?? null;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function LeadRow({ lead }: { lead: CampaignLead }) {
  const [open, setOpen] = useState(false);
  const contact = noteField(lead.notes, "Contact");
  const bestTime = noteField(lead.notes, "Best time to call");

  return (
    <div className="crm-card rounded-lg border p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{lead.businessName}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_TONES[lead.status] ?? "bg-zinc-500/10 text-zinc-500"}`}>
              {lead.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500">
            {contact ? `${contact} · ` : ""}{lead.city ?? "Area not given"} · {formatWhen(lead.createdAt)}
          </p>
          {bestTime && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <CalendarClock className="h-3.5 w-3.5" /> Wants a call: {bestTime}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lead.phone && (
            <a href={`tel:${lead.phone}`}>
              <Button size="sm"><Phone className="h-4 w-4" /> Call</Button>
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`}>
              <Button variant="outline" size="sm"><Mail className="h-4 w-4" /> Email</Button>
            </a>
          )}
          <a href={`/leads?q=${encodeURIComponent(lead.businessName)}`}>
            <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" /> Open</Button>
          </a>
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide" : "Details"}
          </Button>
        </div>
      </div>

      {open && lead.notes && (
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
          {lead.notes}
        </pre>
      )}
    </div>
  );
}

export default function CampaignPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/campaign/leads")
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "The campaign data could not be loaded.");
        return body as Payload;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const conversion = useMemo(() => {
    if (!data?.totals.uniqueVisitors) return "—";
    return `${(data.totals.conversionRate * 100).toFixed(1)}%`;
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Paid acquisition"
        title="Ad Campaign"
        description="Everyone who asked for a call from the Facebook landing page, and the traffic it took to get them."
        actions={(
          <a href="/cleaningbook" target="_blank" rel="noopener noreferrer">
            <Button variant="outline"><ExternalLink className="h-4 w-4" /> View landing page</Button>
          </a>
        )}
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricTile
          icon={Megaphone}
          label="Leads"
          value={(data?.totals.leadsAllTime ?? 0).toLocaleString()}
          detail="All time from the ad."
          tone="emerald"
        />
        <MetricTile
          icon={Users}
          label="Visitors"
          value={(data?.totals.uniqueVisitors ?? 0).toLocaleString()}
          detail={`Unique, last ${data?.days ?? 30} days.`}
          tone="cyan"
        />
        <MetricTile
          icon={TrendingUp}
          label="Conversion"
          value={conversion}
          detail="Visitors who asked for a call."
          tone="amber"
        />
        <MetricTile
          icon={MousePointerClick}
          label="Demo calls"
          value={(data?.totals.demoSessions ?? 0).toLocaleString()}
          detail="Voice demos started."
          tone="rose"
        />
      </section>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      {!!data?.creatives.length && (
        <Card>
          <CardContent className="py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Traffic by creative</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.creatives.map((creative) => (
                <span
                  key={creative.label}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300"
                >
                  {creative.label} · <strong className="font-semibold">{creative.count}</strong>
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Tag each ad with <code className="font-mono">utm_content</code> to tell creatives apart here.
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-zinc-100/80 dark:bg-white/10" />)}
        </div>
      ) : !data?.leads.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Megaphone className="mx-auto mb-3 h-6 w-6 text-zinc-300" />
            <p className="font-semibold text-zinc-500">No ad leads yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-zinc-400">
              Anyone who fills in the form on the landing page lands here — and in Leads — with their
              number, the time they want to be called, and which ad they came from.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.leads.map((lead) => <LeadRow key={lead.id} lead={lead} />)}
        </div>
      )}
    </div>
  );
}
