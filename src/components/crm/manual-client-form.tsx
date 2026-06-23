"use client";

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { leadPriorities, leadStatuses } from "@/lib/schemas";
import { formatStatus } from "@/lib/utils";

type ManualClientFormProps = {
  onCreated?: (lead: any) => void;
  compact?: boolean;
};

export function ManualClientForm({ onCreated, compact = false }: ManualClientFormProps) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function createClient(formData: FormData) {
    setSaving(true);
    setMessage("");

    const category = String(formData.get("category") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const payload = {
      businessName: formData.get("businessName"),
      category: category.includes("Manually onboarded")
        ? category
        : `${category || "Manual Client"} · Manually onboarded`,
      phone: formData.get("phone") || null,
      email: formData.get("email") || null,
      website: formData.get("website") || null,
      address: formData.get("address") || null,
      city: formData.get("city") || null,
      state: formData.get("state") || null,
      status: formData.get("status") || "SAVED",
      priority: formData.get("priority") || "STANDARD",
      notes: notes ? `${notes}\nManually onboarded` : "Manually onboarded",
    };

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error ?? "Could not add client");
      return;
    }

    setMessage(`${data.lead.businessName} added to CRM`);
    onCreated?.(data.lead);
  }

  return (
    <Card id="manual-client" className={compact ? "border-[var(--accent)]/30" : ""}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)]">
            <UserPlus className="h-4 w-4" />
          </span>
          <div>
            <CardTitle>Manual Client Entry</CardTitle>
            <p className="text-sm text-zinc-500">Add referrals, walk-ins, or existing relationships without scraping.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={createClient} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 xl:col-span-2">
            <Label>Business name</Label>
            <Input name="businessName" placeholder="Acme Roofing" required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input name="category" placeholder="Roofing contractor" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select name="status" defaultValue="SAVED">
              {leadStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select name="priority" defaultValue="STANDARD">
              {leadPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {formatStatus(priority)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input name="phone" placeholder="(919) 555-0199" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="owner@example.com" />
          </div>
          <div className="space-y-2 xl:col-span-2">
            <Label>Website</Label>
            <Input name="website" placeholder="https://example.com" />
          </div>
          <div className="space-y-2 xl:col-span-2">
            <Label>Address</Label>
            <Input name="address" placeholder="123 Main St" />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input name="city" placeholder="Raleigh" />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input name="state" placeholder="NC" />
          </div>
          <div className="space-y-2 md:col-span-2 xl:col-span-4">
            <Label>Opening note</Label>
            <Textarea name="notes" placeholder="How did they come in? Who should follow up?" />
          </div>
          <div className="flex items-center gap-3 md:col-span-2 xl:col-span-4">
            <Button disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Adding..." : "Add client"}
            </Button>
            {message ? <p className="text-sm text-zinc-500">{message}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
