"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Activity, Building2, CalendarClock, Download, Edit3, ExternalLink, FileCode2, FileJson, FileText, Folder, Globe2, Loader2, Mail, MapPin, MessageSquareQuote, Navigation, Phone, PhoneCall, Save, Sparkles, Star, Terminal, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { ScoreCard } from "@/components/crm/score-card";
import { callOutcomes, leadPriorities, leadStatuses, noteTypes } from "@/lib/schemas";
import { kitSlug } from "@/lib/website-kit";
import { formatStatus } from "@/lib/utils";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"}`}
        />
      ))}
    </span>
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

  useEffect(() => {
    if (!id) return;
    fetch(`/api/leads/${id}`).then((res) => res.json()).then((data) => setLead(data.lead));
    setPhotosLoading(true);
    fetch(`/api/leads/${id}/photos`)
      .then((res) => res.json())
      .then((data) => setPhotos({ logo: data.logo ?? null, cover: data.cover ?? null, photos: data.photos ?? [] }))
      .catch(() => setPhotos({ logo: null, cover: null, photos: [] }))
      .finally(() => setPhotosLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    setLead({ ...lead, status });
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function updatePriority(priority: string) {
    setLead({ ...lead, priority });
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priority }) });
  }

  async function saveProfile(formData: FormData) {
    setSavingProfile(true);
    setMessage("");
    const payload = {
      businessName: formData.get("businessName"),
      category: formData.get("category") || null,
      phone: formData.get("phone") || null,
      email: formData.get("email") || null,
      website: formData.get("website") || null,
      address: formData.get("address") || null,
      city: formData.get("city") || null,
      state: formData.get("state") || null,
      googleMapsUrl: formData.get("googleMapsUrl") || null,
      googleRating: formData.get("googleRating") || null,
      googleReviewCount: formData.get("googleReviewCount") || null,
      notes: formData.get("notes") || null,
      status: formData.get("status"),
      priority: formData.get("priority"),
    };
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSavingProfile(false);

    if (!res.ok) {
      return setMessage(data.error ?? "Could not update profile");
    }

    setLead({ ...lead, ...data.lead });
    setEditing(false);
    setMessage("Client profile updated");
  }

  async function addNote(formData: FormData) {
    const callOutcome = String(formData.get("callOutcome"));
    const payload = {
      note: formData.get("note"),
      noteType: formData.get("noteType"),
      callOutcome,
      followUpDate: formData.get("followUpDate") ? new Date(String(formData.get("followUpDate"))).toISOString() : "",
    };
    const res = await fetch(`/api/leads/${id}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error ?? "Could not save note");
    const status = callOutcome === "MEETING_BOOKED" || callOutcome === "FOLLOW_UP" || callOutcome === "CLOSED" || callOutcome === "NOT_INTERESTED"
      ? callOutcome
      : "CALLED";
    setLead({ ...lead, callNotes: [data.note, ...(lead.callNotes ?? [])], status });
    setMessage("Call note saved");
  }

  async function deleteLead() {
    if (!window.confirm(`Delete ${lead.businessName ?? "this client"} from the CRM? This can't be undone.`)) return;
    setDeleting(true);
    setMessage("");
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setDeleting(false);
      const data = await res.json().catch(() => ({}));
      return setMessage(data.error ?? "Could not delete this client");
    }
    router.push("/clients");
  }

  async function downloadKit() {
    setDownloading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/leads/${id}/kit`);
      if (!res.ok) throw new Error("kit failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? "website-kit.zip";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Could not build the rebuild kit. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (!lead) return <div className="h-96 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />;

  const initials = String(lead.businessName ?? "LL")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const locationLabel = [lead.city, lead.state].filter(Boolean).join(", ") || "No market listed";
  const latestNote = lead.callNotes?.[0];
  const rating = typeof lead.googleRating === "number" ? lead.googleRating : null;
  const directionsUrl =
    lead.googleMapsUrl ??
    (lead.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}` : null);
  const galleryPhotos = photos?.photos ?? [];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="px-5 pt-5 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-[var(--accent)] text-xl font-semibold text-[var(--accent-foreground)] shadow-sm dark:border-zinc-800">
                {photos?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos.logo} alt={`${lead.businessName} logo`} className="h-full w-full bg-white object-contain" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{lead.businessName}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  {rating != null ? (
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium text-amber-600 dark:text-amber-400">{rating.toFixed(1)}</span>
                      <Stars value={rating} />
                      <span className="text-zinc-400">({lead.googleReviewCount ?? 0})</span>
                    </span>
                  ) : (
                    <span className="text-zinc-400">No reviews yet</span>
                  )}
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span>{lead.category ?? "Uncategorized"}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {locationLabel}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={lead.status} />
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900">
                <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" />
                {formatStatus(lead.priority ?? "STANDARD")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={deleteLead}
                disabled={deleting}
                title="Delete client from CRM"
                aria-label="Delete client from CRM"
                className="text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {lead.phone ? <a href={`tel:${lead.phone}`}><Button variant="outline" size="sm"><Phone className="h-4 w-4" /> Call</Button></a> : null}
            {directionsUrl ? <a href={directionsUrl} target="_blank"><Button variant="outline" size="sm"><Navigation className="h-4 w-4" /> Directions</Button></a> : null}
            {lead.email ? <a href={`mailto:${lead.email}`}><Button variant="outline" size="sm"><Mail className="h-4 w-4" /> Email</Button></a> : null}
            {lead.googleMapsUrl ? <a href={lead.googleMapsUrl} target="_blank"><Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" /> Google profile</Button></a> : null}
            {lead.website ? <a href={lead.website} target="_blank"><Button variant="outline" size="sm"><Globe2 className="h-4 w-4" /> Website</Button></a> : null}
          </div>
        </div>

        <div className="grid gap-0 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800 md:grid-cols-4 md:divide-x md:divide-y-0">
          <div className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500"><Phone className="h-4 w-4" /> Phone</div>
            <p className="mt-2 truncate text-sm font-medium">{lead.phone ?? "No phone listed"}</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500"><MapPin className="h-4 w-4" /> Address</div>
            <p className="mt-2 truncate text-sm font-medium">{lead.address ?? "No address listed"}</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500"><Star className="h-4 w-4" /> Google rating</div>
            <p className="mt-2 text-sm font-medium">{lead.googleRating ?? "--"} <span className="font-normal text-zinc-500">from {lead.googleReviewCount ?? 0} reviews</span></p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500"><CalendarClock className="h-4 w-4" /> Last touch</div>
            <p className="mt-2 truncate text-sm font-medium">{latestNote ? new Date(latestNote.createdAt).toLocaleDateString() : "No notes yet"}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900">
              <Folder className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight">Website Rebuild Kit</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-[var(--accent-foreground)]">
                  <Sparkles className="h-3 w-3" /> Claude-powered
                </span>
              </div>
              <p className="mt-1 max-w-xl text-sm text-zinc-500">
                Download a ready-to-run folder. One command runs Claude Code to rebuild {lead.businessName}&apos;s
                site from scratch — modern, smooth, and built around their real Google reviews
                {photos?.photos?.length ? ` and ${photos.photos.length} photos pulled from their current site` : ""}.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2">
            <Button onClick={downloadKit} disabled={downloading} className="whitespace-nowrap">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {downloading ? "Building kit…" : "Download rebuild kit"}
            </Button>
            <p className="text-center text-xs text-zinc-400">.zip · runs with Claude Code</p>
          </div>
        </div>

        <div className="grid gap-4 border-t border-zinc-200 p-5 dark:border-zinc-800 lg:grid-cols-[260px_1fr]">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
            <p className="flex items-center gap-2 pb-2 font-sans font-medium text-zinc-700 dark:text-zinc-200">
              <Folder className="h-4 w-4" /> {kitSlug(lead.businessName)}-website-kit/
            </p>
            <ul className="space-y-1.5 pl-1">
              <li className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5 text-emerald-500" /> rebuild.sh</li>
              <li className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-sky-500" /> PROMPT.md</li>
              <li className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-sky-500" /> CLAUDE.md</li>
              <li className="flex items-center gap-2"><FileJson className="h-3.5 w-3.5 text-amber-500" /> data/business.json</li>
              <li className="flex items-center gap-2"><FileJson className="h-3.5 w-3.5 text-amber-500" /> data/reviews.json</li>
              <li className="flex items-center gap-2"><FileCode2 className="h-3.5 w-3.5 text-zinc-400" /> site/index.html</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { icon: MessageSquareQuote, label: "Real Google reviews", desc: "Top reviews bundled in, quoted verbatim" },
                { icon: Sparkles, label: "Smooth & modern", desc: "Responsive, animated, accessible, fast" },
                { icon: Globe2, label: "Deploy anywhere", desc: "Plain static HTML/CSS/JS, no build step" },
              ].map((feature) => (
                <div key={feature.label} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <feature.icon className="h-4 w-4 text-zinc-500" />
                  <p className="mt-2 text-sm font-medium">{feature.label}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{feature.desc}</p>
                </div>
              ))}
            </div>
            {photosLoading ? (
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 w-14 shrink-0 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
                ))}
              </div>
            ) : galleryPhotos.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Assets included from their site</p>
                <div className="flex flex-wrap gap-2">
                  {galleryPhotos.slice(0, 8).map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActivePhoto(src)}
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 transition hover:ring-2 hover:ring-[var(--accent)] dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`${lead.businessName} asset`} loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {message ? <p className="text-sm text-zinc-500">{message}</p> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <ScoreCard label="Performance" value={lead.pageSpeedPerformance} />
        <ScoreCard label="Accessibility" value={lead.pageSpeedAccessibility} />
        <ScoreCard label="SEO" value={lead.pageSpeedSEO} />
        <ScoreCard label="Best Practices" value={lead.pageSpeedBestPractices} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle>Business Profile</CardTitle>
                    <p className="text-sm text-zinc-500">Contact details, Google profile data, and internal context.</p>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing((value) => !value)}>
                  {editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  {editing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editing ? (
                <form action={saveProfile} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Business name</Label>
                    <Input name="businessName" defaultValue={lead.businessName ?? ""} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input name="category" defaultValue={lead.category ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Call status</Label>
                    <Select name="status" defaultValue={lead.status}>
                      {leadStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue={lead.priority ?? "STANDARD"}>
                      {leadPriorities.map((priority) => <option key={priority} value={priority}>{formatStatus(priority)}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input name="phone" defaultValue={lead.phone ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input name="email" type="email" defaultValue={lead.email ?? ""} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Website</Label>
                    <Input name="website" defaultValue={lead.website ?? ""} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Google Maps URL</Label>
                    <Input name="googleMapsUrl" defaultValue={lead.googleMapsUrl ?? ""} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Input name="address" defaultValue={lead.address ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input name="city" defaultValue={lead.city ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input name="state" defaultValue={lead.state ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Google rating</Label>
                    <Input name="googleRating" type="number" step="0.1" min="0" max="5" defaultValue={lead.googleRating ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Review count</Label>
                    <Input name="googleReviewCount" type="number" min="0" defaultValue={lead.googleReviewCount ?? ""} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Internal notes</Label>
                    <Textarea name="notes" defaultValue={lead.notes ?? ""} />
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <Button disabled={savingProfile}>
                      <Save className="h-4 w-4" />
                      {savingProfile ? "Saving..." : "Save profile"}
                    </Button>
                    {message ? <p className="text-sm text-zinc-500">{message}</p> : null}
                  </div>
                </form>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                    <p className="flex items-center gap-2 text-sm text-zinc-500"><Phone className="h-4 w-4" /> Phone</p>
                    <p className="mt-2 font-medium">{lead.phone ?? "No phone listed"}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                    <p className="flex items-center gap-2 text-sm text-zinc-500"><Mail className="h-4 w-4" /> Email</p>
                    <p className="mt-2 font-medium">{lead.email ?? "No email listed"}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                    <p className="flex items-center gap-2 text-sm text-zinc-500"><MapPin className="h-4 w-4" /> Address</p>
                    <p className="mt-2 font-medium">{lead.address ?? "No address listed"}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                    <p className="flex items-center gap-2 text-sm text-zinc-500"><Star className="h-4 w-4" /> Google proof</p>
                    <p className="mt-2 font-medium">{lead.googleRating ?? "--"} <span className="font-normal text-zinc-500">from {lead.googleReviewCount ?? 0} reviews</span></p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 md:col-span-2">
                    <p className="text-sm text-zinc-500">Internal notes</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{lead.notes ?? "No internal notes"}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Call status</Label>
                    <Select value={lead.status} onChange={(event) => updateStatus(event.target.value)}>
                      {leadStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Priority</Label>
                    <Select value={lead.priority ?? "STANDARD"} onChange={(event) => updatePriority(event.target.value)}>
                      {leadPriorities.map((priority) => <option key={priority} value={priority}>{formatStatus(priority)}</option>)}
                    </Select>
                  </div>
                  {message ? <p className="text-sm text-zinc-500 md:col-span-2">{message}</p> : null}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notes Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(lead.callNotes ?? []).length ? lead.callNotes.map((note: any) => (
                <div key={note.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                        {formatStatus(note.noteType ?? "GENERAL")} note
                      </span>
                      <Badge value={note.callOutcome} />
                    </div>
                    <span className="text-xs text-zinc-500">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6">{note.note}</p>
                  {note.followUpDate ? <p className="mt-2 text-xs text-amber-600">Follow up {new Date(note.followUpDate).toLocaleDateString()}</p> : null}
                </div>
              )) : <p className="text-sm text-zinc-500">No notes yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  <Activity className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle>Audit History</CardTitle>
                  <p className="text-sm text-zinc-500">Saved PageSpeed runs for this business.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(lead.audits ?? []).length ? lead.audits.map((audit: any) => (
                <div key={audit.id} className="grid gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-medium">{audit.url}</p>
                    <p className="mt-1 text-xs text-zinc-500">{audit.strategy ?? "mobile"} · {new Date(audit.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900"><p className="text-zinc-500">Perf</p><p className="font-semibold">{audit.performance ?? "--"}</p></div>
                    <div className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900"><p className="text-zinc-500">A11y</p><p className="font-semibold">{audit.accessibility ?? "--"}</p></div>
                    <div className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900"><p className="text-zinc-500">SEO</p><p className="font-semibold">{audit.seo ?? "--"}</p></div>
                    <div className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900"><p className="text-zinc-500">Best</p><p className="font-semibold">{audit.bestPractices ?? "--"}</p></div>
                  </div>
                </div>
              )) : <p className="text-sm text-zinc-500">No audits saved yet. Run PageSpeed from the audit page or scraper.</p>}
            </CardContent>
          </Card>
        </div>

        <Card className="xl:sticky xl:top-6 xl:self-start">
          <CardHeader><CardTitle>Add Call Note</CardTitle></CardHeader>
          <CardContent>
            <form action={addNote} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Note type</Label>
                  <Select name="noteType" defaultValue="GENERAL">
                    {noteTypes.map((type) => <option key={type} value={type}>{formatStatus(type)} note</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Select name="callOutcome" defaultValue="FOLLOW_UP">
                    {callOutcomes.map((outcome) => <option key={outcome} value={outcome}>{formatStatus(outcome)}</option>)}
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Follow-up date</Label><Input name="followUpDate" type="datetime-local" /></div>
              <div className="space-y-2"><Label>Note</Label><Textarea name="note" placeholder="What happened on the call?" required /></div>
              <Button className="w-full"><PhoneCall className="h-4 w-4" /> Save note</Button>
              {message ? <p className="text-sm text-zinc-500">{message}</p> : null}
            </form>
          </CardContent>
        </Card>
      </section>

      {activePhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setActivePhoto(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setActivePhoto(null)}
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto}
            alt={`${lead.businessName} photo`}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
