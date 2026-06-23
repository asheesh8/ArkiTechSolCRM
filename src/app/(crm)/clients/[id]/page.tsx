"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { ScoreCard } from "@/components/crm/score-card";
import { callOutcomes, leadStatuses } from "@/lib/schemas";
import { formatStatus } from "@/lib/utils";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [lead, setLead] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/leads/${id}`).then((res) => res.json()).then((data) => setLead(data.lead));
  }, [id]);

  async function updateStatus(status: string) {
    setLead({ ...lead, status });
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function addNote(formData: FormData) {
    const payload = {
      note: formData.get("note"),
      callOutcome: formData.get("callOutcome"),
      followUpDate: formData.get("followUpDate") ? new Date(String(formData.get("followUpDate"))).toISOString() : "",
    };
    const res = await fetch(`/api/leads/${id}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error ?? "Could not save note");
    setLead({ ...lead, callNotes: [data.note, ...(lead.callNotes ?? [])], status: payload.callOutcome });
    setMessage("Call note saved");
  }

  if (!lead) return <div className="h-96 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-semibold tracking-tight">{lead.businessName}</h2><Badge value={lead.status} /></div>
          <p className="mt-1 text-sm text-zinc-500">{lead.category ?? "Uncategorized"} · {[lead.city, lead.state].filter(Boolean).join(", ")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {lead.googleMapsUrl ? <a href={lead.googleMapsUrl} target="_blank"><Button variant="outline"><ExternalLink className="h-4 w-4" /> Google reviews</Button></a> : null}
          {lead.website ? <a href={lead.website} target="_blank"><Button><ExternalLink className="h-4 w-4" /> Website</Button></a> : null}
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
            <CardHeader><CardTitle>Business Profile</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <p><span className="text-sm text-zinc-500">Phone</span><br />{lead.phone ?? "No phone listed"}</p>
              <p><span className="text-sm text-zinc-500">Email</span><br />{lead.email ?? "No email listed"}</p>
              <p><span className="text-sm text-zinc-500">Address</span><br />{lead.address ?? "No address listed"}</p>
              <p><span className="text-sm text-zinc-500">Rating</span><br />{lead.googleRating ?? "--"} from {lead.googleReviewCount ?? 0} reviews</p>
              <div className="space-y-2 md:col-span-2">
                <Label>Call status</Label>
                <Select value={lead.status} onChange={(event) => updateStatus(event.target.value)}>
                  {leadStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notes Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(lead.callNotes ?? []).length ? lead.callNotes.map((note: any) => (
                <div key={note.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3"><Badge value={note.callOutcome} /><span className="text-xs text-zinc-500">{new Date(note.createdAt).toLocaleString()}</span></div>
                  <p className="mt-3 text-sm leading-6">{note.note}</p>
                  {note.followUpDate ? <p className="mt-2 text-xs text-amber-600">Follow up {new Date(note.followUpDate).toLocaleDateString()}</p> : null}
                </div>
              )) : <p className="text-sm text-zinc-500">No notes yet.</p>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Add Call Note</CardTitle></CardHeader>
          <CardContent>
            <form action={addNote} className="space-y-4">
              <div className="space-y-2"><Label>Outcome</Label><Select name="callOutcome" defaultValue="FOLLOW_UP">{callOutcomes.map((outcome) => <option key={outcome} value={outcome}>{formatStatus(outcome)}</option>)}</Select></div>
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
