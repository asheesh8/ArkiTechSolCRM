"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Activity, Building2, CalendarClock, CheckCircle2, ChevronDown, ChevronRight,
  Download, Edit3, ExternalLink, FileCode2, FileJson, FileText, Folder, Globe2,
  Loader2, Mail, MapPin, MessageSquareQuote, Navigation, Phone, PhoneCall,
  PhoneMissed, Save, Sparkles, Star, Terminal, ThumbsDown, ThumbsUp, Trash2,
  UserCheck, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { ScoreCard } from "@/components/crm/score-card";
import { leadPriorities, leadStatuses, noteTypes, callOutcomes } from "@/lib/schemas";
import { kitSlug } from "@/lib/website-kit";
import { cn, formatStatus } from "@/lib/utils";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"}`} />
      ))}
    </span>
  );
}

// Conversational outcome options
const OUTCOMES = [
  {
    value: "FOLLOW_UP",
    label: "Schedule follow-up",
    sub: "Good convo, needs another touch",
    icon: PhoneCall,
    color: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950",
    activeColor: "border-amber-400 bg-amber-100 ring-2 ring-amber-300 dark:border-amber-500 dark:bg-amber-950 dark:ring-amber-700",
  },
  {
    value: "MEETING_BOOKED",
    label: "Meeting booked!",
    sub: "They want to talk — lock it in",
    icon: ThumbsUp,
    color: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950",
    activeColor: "border-emerald-400 bg-emerald-100 ring-2 ring-emerald-300 dark:border-emerald-500 dark:bg-emerald-950 dark:ring-emerald-700",
  },
  {
    value: "CALLED",
    label: "Just logged a call",
    sub: "Left a message or short chat",
    icon: PhoneMissed,
    color: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300 dark:hover:bg-sky-950",
    activeColor: "border-sky-400 bg-sky-100 ring-2 ring-sky-300 dark:border-sky-500 dark:bg-sky-950 dark:ring-sky-700",
  },
  {
    value: "NOT_INTERESTED",
    label: "Not interested",
    sub: "Pass — remove from active list",
    icon: ThumbsDown,
    color: "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-900",
    activeColor: "border-zinc-400 bg-zinc-100 ring-2 ring-zinc-300 dark:border-zinc-500 dark:bg-zinc-900 dark:ring-zinc-600",
  },
  {
    value: "CLOSED",
    label: "Closed! 🎉",
    sub: "They signed — ready to onboard",
    icon: CheckCircle2,
    color: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-950",
    activeColor: "border-violet-400 bg-violet-100 ring-2 ring-violet-300 dark:border-violet-500 dark:bg-violet-950 dark:ring-violet-700",
  },
] as const;

type Outcome = typeof OUTCOMES[number]["value"];

function CallLogPanel({ leadId, onSaved }: { leadId: string; onSaved: (note: any, status: string) => void }) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!outcome) return;
    setSaving(true);
    const res = await fetch(`/api/leads/${leadId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        note: note || `Outcome: ${formatStatus(outcome)}`,
        noteType: outcome === "MEETING_BOOKED" ? "MEETING" : outcome === "FOLLOW_UP" ? "FOLLOW_UP" : "GENERAL",
        callOutcome: outcome,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : "",
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return;
    const newStatus = ["MEETING_BOOKED", "FOLLOW_UP", "CLOSED", "NOT_INTERESTED"].includes(outcome) ? outcome : "CALLED";
    onSaved(data.note, newStatus);
    setOutcome(null);
    setNote("");
    setFollowUpDate("");
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        <p className="font-semibold">Logged!</p>
        <p className="text-sm text-zinc-500">Status updated automatically.</p>
        <button type="button" onClick={() => setDone(false)} className="text-sm text-zinc-400 underline hover:text-zinc-600">Log another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">How did the call go?</p>
        <div className="grid gap-2">
          {OUTCOMES.map((opt) => {
            const Icon = opt.icon;
            const active = outcome === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setOutcome(active ? null : opt.value)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                  active ? opt.activeColor : opt.color,
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{opt.label}</p>
                  <p className="mt-0.5 text-xs opacity-70">{opt.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {outcome && (
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          {(outcome === "FOLLOW_UP" || outcome === "MEETING_BOOKED") && (
            <div className="space-y-1.5">
              <Label>{outcome === "MEETING_BOOKED" ? "Meeting date & time" : "Follow-up date"}</Label>
              <Input type="datetime-local" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} required={outcome === "MEETING_BOOKED"} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Notes <span className="font-normal text-zinc-400">(optional)</span></Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                outcome === "MEETING_BOOKED" ? "What did they want to talk about?" :
                outcome === "FOLLOW_UP" ? "What should you bring up next time?" :
                outcome === "NOT_INTERESTED" ? "Why not? Good for future reference." :
                outcome === "CLOSED" ? "How did you close it?" :
                "What happened on the call?"
              }
              rows={3}
            />
          </div>
          <Button className="w-full" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
            {saving ? "Saving…" : "Save call log"}
          </Button>
        </div>
      )}
    </form>
  );
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [lead, setLead] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [photos, setPhotos] = useState<{ logo: string | null; cover: string | null; photos: string[] } | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAudits, setShowAudits] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/leads/${id}`).then((r) => r.json()).then((d) => setLead(d.lead));
    setPhotosLoading(true);
    fetch(`/api/leads/${id}/photos`)
      .then((r) => r.json())
      .then((d) => setPhotos({ logo: d.logo ?? null, cover: d.cover ?? null, photos: d.photos ?? [] }))
      .catch(() => setPhotos({ logo: null, cover: null, photos: [] }))
      .finally(() => setPhotosLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    setLead((prev: any) => ({ ...prev, status }));
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function saveProfile(formData: FormData) {
    setSavingProfile(true);
    setMessage("");
    const payload: Record<string, any> = {};
    for (const key of ["businessName","category","phone","email","website","address","city","state","googleMapsUrl","googleRating","googleReviewCount","notes","priority"]) {
      payload[key] = formData.get(key) || null;
    }
    payload.businessName = formData.get("businessName");
    const res = await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSavingProfile(false);
    if (!res.ok) return setMessage(data.error ?? "Could not update profile");
    setLead((prev: any) => ({ ...prev, ...data.lead }));
    setEditing(false);
    setMessage("Saved");
    setTimeout(() => setMessage(""), 2000);
  }

  function handleCallSaved(note: any, status: string) {
    setLead((prev: any) => ({ ...prev, callNotes: [note, ...(prev.callNotes ?? [])], status }));
  }

  async function deleteLead() {
    if (!window.confirm(`Delete ${lead.businessName ?? "this lead"}? This can't be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) { setDeleting(false); return; }
    router.push("/clients");
  }

  async function downloadKit() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/leads/${id}/kit`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? "website-kit.zip";
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
      document.body.appendChild(a); a.click(); a.remove();
    } finally { setDownloading(false); }
  }

  if (!lead) return <div className="h-96 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />;

  const initials = String(lead.businessName ?? "LL").split(/\s+/).slice(0, 2).map((p: string) => p[0]).join("").toUpperCase();
  const locationLabel = [lead.city, lead.state].filter(Boolean).join(", ") || "No location";
  const rating = typeof lead.googleRating === "number" ? lead.googleRating : null;
  const directionsUrl = lead.googleMapsUrl ?? (lead.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}` : null);
  const galleryPhotos = photos?.photos ?? [];

  return (
    <div className="space-y-6">

      {/* ── Hero header ── */}
      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-[var(--accent)] text-xl font-bold text-[var(--accent-foreground)] dark:border-zinc-800">
                {photos?.logo
                  ? <img src={photos.logo} alt={lead.businessName} className="h-full w-full bg-white object-contain" />
                  : initials}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{lead.businessName}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500">
                  {rating != null
                    ? <span className="flex items-center gap-1.5"><span className="font-medium text-amber-600 dark:text-amber-400">{rating.toFixed(1)}</span><Stars value={rating} /><span className="text-zinc-400">({lead.googleReviewCount ?? 0})</span></span>
                    : <span className="text-zinc-400">No reviews</span>}
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span>{lead.category ?? "Uncategorized"}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{locationLabel}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge value={lead.status} />
              <Button variant="ghost" size="icon" onClick={deleteLead} disabled={deleting} className="text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Quick action bar */}
          <div className="mt-4 flex flex-wrap gap-2">
            {lead.phone && <a href={`tel:${lead.phone}`}><Button variant="outline" size="sm"><Phone className="h-4 w-4" />{lead.phone}</Button></a>}
            {directionsUrl && <a href={directionsUrl} target="_blank"><Button variant="outline" size="sm"><Navigation className="h-4 w-4" />Directions</Button></a>}
            {lead.email && <a href={`mailto:${lead.email}`}><Button variant="outline" size="sm"><Mail className="h-4 w-4" />Email</Button></a>}
            {lead.googleMapsUrl && <a href={lead.googleMapsUrl} target="_blank"><Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" />Google</Button></a>}
            {lead.website && <a href={lead.website} target="_blank"><Button variant="outline" size="sm"><Globe2 className="h-4 w-4" />Website</Button></a>}
            <a href={`/clients/${id}/onboard`}><Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700"><UserCheck className="h-4 w-4" />Onboard</Button></a>
          </div>
        </div>

        {/* Status chips */}
        <div className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-zinc-400">Move to stage</p>
          <div className="flex flex-wrap gap-2">
            {leadStatuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateStatus(s)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  lead.status === s
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
                )}
              >
                {formatStatus(s)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PageSpeed scores ── */}
      {(lead.pageSpeedPerformance != null || lead.pageSpeedSEO != null) && (
        <section className="grid gap-4 md:grid-cols-4">
          <ScoreCard label="Performance" value={lead.pageSpeedPerformance} />
          <ScoreCard label="Accessibility" value={lead.pageSpeedAccessibility} />
          <ScoreCard label="SEO" value={lead.pageSpeedSEO} />
          <ScoreCard label="Best Practices" value={lead.pageSpeedBestPractices} />
        </section>
      )}

      {/* ── Main 2-column layout ── */}
      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">

        {/* Left: notes timeline + profile + audits */}
        <div className="space-y-6">

          {/* Notes timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900"><PhoneCall className="h-4 w-4 text-zinc-600 dark:text-zinc-300" /></span>
                <CardTitle>Call History</CardTitle>
                <span className="ml-auto text-xs text-zinc-400">{(lead.callNotes ?? []).length} entries</span>
              </div>
            </CardHeader>
            <CardContent>
              {(lead.callNotes ?? []).length === 0
                ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center text-zinc-400">
                    <PhoneCall className="h-8 w-8 opacity-30" />
                    <p className="text-sm">No calls logged yet.</p>
                    <p className="text-xs">Log your first call using the panel on the right.</p>
                  </div>
                )
                : (
                  <div className="relative space-y-4 pl-5 before:absolute before:left-1.5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
                    {lead.callNotes.map((note: any) => (
                      <div key={note.id} className="relative">
                        <span className="absolute -left-4 top-3.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-zinc-300 dark:border-zinc-950 dark:bg-zinc-600" />
                        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Badge value={note.callOutcome} />
                            <span className="text-xs text-zinc-400">{new Date(note.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                          </div>
                          <p className="mt-3 text-sm leading-6">{note.note}</p>
                          {note.followUpDate && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                              <CalendarClock className="h-3.5 w-3.5" />
                              Follow up {new Date(note.followUpDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Business profile (collapsed by default) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900"><Building2 className="h-4 w-4 text-zinc-600 dark:text-zinc-300" /></span>
                  <CardTitle>Business Profile</CardTitle>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
                  {editing ? <><X className="h-4 w-4" />Cancel</> : <><Edit3 className="h-4 w-4" />Edit</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editing ? (
                <form action={saveProfile} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2"><Label>Business name</Label><Input name="businessName" defaultValue={lead.businessName ?? ""} required /></div>
                  <div className="space-y-2"><Label>Category</Label><Input name="category" defaultValue={lead.category ?? ""} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input name="phone" defaultValue={lead.phone ?? ""} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={lead.email ?? ""} /></div>
                  <div className="space-y-2"><Label>Website</Label><Input name="website" defaultValue={lead.website ?? ""} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input name="address" defaultValue={lead.address ?? ""} /></div>
                  <div className="space-y-2"><Label>City</Label><Input name="city" defaultValue={lead.city ?? ""} /></div>
                  <div className="space-y-2"><Label>State</Label><Input name="state" defaultValue={lead.state ?? ""} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Google Maps URL</Label><Input name="googleMapsUrl" defaultValue={lead.googleMapsUrl ?? ""} /></div>
                  <div className="space-y-2"><Label>Google rating</Label><Input name="googleRating" type="number" step="0.1" min="0" max="5" defaultValue={lead.googleRating ?? ""} /></div>
                  <div className="space-y-2"><Label>Review count</Label><Input name="googleReviewCount" type="number" min="0" defaultValue={lead.googleReviewCount ?? ""} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Internal notes</Label><Textarea name="notes" defaultValue={lead.notes ?? ""} /></div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <Button disabled={savingProfile}><Save className="h-4 w-4" />{savingProfile ? "Saving…" : "Save"}</Button>
                    {message && <p className="text-sm text-emerald-600">{message}</p>}
                  </div>
                </form>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Phone, label: "Phone", value: lead.phone },
                    { icon: Mail, label: "Email", value: lead.email },
                    { icon: MapPin, label: "Address", value: lead.address },
                    { icon: Star, label: "Google proof", value: lead.googleRating ? `${lead.googleRating} from ${lead.googleReviewCount ?? 0} reviews` : null },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <p className="flex items-center gap-1.5 text-xs text-zinc-500"><Icon className="h-3.5 w-3.5" />{label}</p>
                      <p className="mt-1.5 text-sm font-medium">{value ?? <span className="text-zinc-400">Not listed</span>}</p>
                    </div>
                  ))}
                  {lead.notes && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40 sm:col-span-2">
                      <p className="text-xs text-zinc-500">Internal notes</p>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6">{lead.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit history — collapsible */}
          {(lead.audits ?? []).length > 0 && (
            <Card>
              <CardHeader>
                <button type="button" className="flex w-full items-center gap-2" onClick={() => setShowAudits((v) => !v)}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900"><Activity className="h-4 w-4 text-zinc-600 dark:text-zinc-300" /></span>
                  <CardTitle>Audit History</CardTitle>
                  <span className="ml-auto text-xs text-zinc-400">{lead.audits.length} runs</span>
                  {showAudits ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                </button>
              </CardHeader>
              {showAudits && (
                <CardContent className="space-y-3">
                  {lead.audits.map((audit: any) => (
                    <div key={audit.id} className="grid gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <p className="font-medium text-sm">{audit.url}</p>
                        <p className="mt-1 text-xs text-zinc-500">{audit.strategy ?? "mobile"} · {new Date(audit.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        {[["Perf", audit.performance], ["A11y", audit.accessibility], ["SEO", audit.seo], ["Best", audit.bestPractices]].map(([label, val]) => (
                          <div key={label} className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900"><p className="text-zinc-500">{label}</p><p className="font-semibold">{val ?? "--"}</p></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* Right: call log panel + website kit */}
        <div className="space-y-6">

          {/* Call log panel — sticky */}
          <div className="xl:sticky xl:top-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900"><PhoneCall className="h-4 w-4 text-zinc-600 dark:text-zinc-300" /></span>
                  <div>
                    <CardTitle>Log a call</CardTitle>
                    <p className="text-xs text-zinc-400">What happened? Pick one and we'll update their stage.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CallLogPanel leadId={id} onSaved={handleCallSaved} />
              </CardContent>
            </Card>

            {/* Website rebuild kit */}
            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800">
                  <Folder className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">Website Rebuild Kit</p>
                    <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent-foreground)]"><Sparkles className="inline h-2.5 w-2.5" /> Claude</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 leading-5">Download a ready-to-run folder. One command builds their new site from scratch using real reviews{galleryPhotos.length ? ` + ${galleryPhotos.length} photos` : ""}.</p>
                </div>
              </div>
              <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                <Button onClick={downloadKit} disabled={downloading} className="w-full">
                  {downloading ? <><Loader2 className="h-4 w-4 animate-spin" />Building kit…</> : <><Download className="h-4 w-4" />Download rebuild kit</>}
                </Button>
                <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <p className="mb-2 font-sans text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5"><Folder className="h-3.5 w-3.5" />{kitSlug(lead.businessName)}-website-kit/</p>
                  {[["rebuild.sh","text-emerald-500"], ["PROMPT.md","text-sky-500"], ["data/business.json","text-amber-500"], ["site/index.html","text-zinc-400"]].map(([file, color]) => (
                    <div key={file} className="flex items-center gap-2 py-0.5"><span className={`h-3 w-3 rounded-sm ${color} bg-current opacity-70`} />{file}</div>
                  ))}
                </div>
                {photosLoading ? null : galleryPhotos.length > 0 ? (
                  <div className="mt-3">
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">Assets pulled from their site</p>
                    <div className="flex flex-wrap gap-1.5">
                      {galleryPhotos.slice(0, 6).map((src) => (
                        <button key={src} type="button" onClick={() => setActivePhoto(src)} className="h-12 w-12 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 transition hover:ring-2 hover:ring-[var(--accent)] dark:border-zinc-800">
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo lightbox */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={() => setActivePhoto(null)}>
          <button type="button" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => setActivePhoto(null)}><X className="h-5 w-5" /></button>
          <img src={activePhoto} alt="" className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
