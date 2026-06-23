"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, Building2, CalendarClock, Edit3, ExternalLink, Globe2, Mail, MapPin, Phone, PhoneCall, Save, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { ScoreCard } from "@/components/crm/score-card";
import { callOutcomes, leadPriorities, leadStatuses, noteTypes } from "@/lib/schemas";
import { formatStatus } from "@/lib/utils";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [lead, setLead] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/leads/${id}`).then((res) => res.json()).then((data) => setLead(data.lead));
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

  if (!lead) return <div className="h-96 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />;

  const initials = String(lead.businessName ?? "LL")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const locationLabel = [lead.city, lead.state].filter(Boolean).join(", ") || "No market listed";
  const latestNote = lead.callNotes?.[0];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-lg font-semibold text-[var(--accent-foreground)]">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight">{lead.businessName}</h2>
                  <Badge value={lead.status} />
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900">
                    <Star className="mr-1 h-3 w-3" />
                    {formatStatus(lead.priority ?? "STANDARD")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{lead.category ?? "Uncategorized"} · {locationLabel}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {lead.phone ? <a href={`tel:${lead.phone}`}><Button variant="outline"><Phone className="h-4 w-4" /> Call</Button></a> : null}
              {lead.email ? <a href={`mailto:${lead.email}`}><Button variant="outline"><Mail className="h-4 w-4" /> Email</Button></a> : null}
              {lead.googleMapsUrl ? <a href={lead.googleMapsUrl} target="_blank"><Button variant="outline"><ExternalLink className="h-4 w-4" /> Google profile</Button></a> : null}
              {lead.website ? <a href={lead.website} target="_blank"><Button><Globe2 className="h-4 w-4" /> Website</Button></a> : null}
            </div>
          </div>
        </div>
        <div className="grid gap-0 divide-y divide-zinc-200 dark:divide-zinc-800 md:grid-cols-4 md:divide-x md:divide-y-0">
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
    </div>
  );
}
