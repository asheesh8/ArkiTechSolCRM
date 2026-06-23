"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, GitMerge, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";

type CsvImportCardProps = {
  onImported?: (leads: any[]) => void;
};

type DuplicateCandidate = {
  row: number;
  reason: string;
  existingLead: null | {
    id: string;
    businessName: string;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    website?: string | null;
    status?: string | null;
  };
  payload: Record<string, any>;
};

type DuplicateAction = "CANCEL" | "MERGE" | "ADD_COPY";

export function CsvImportCard({ onImported }: CsvImportCardProps) {
  const [message, setMessage] = useState("");
  const [skipped, setSkipped] = useState<{ row: number; reason: string }[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [decisions, setDecisions] = useState<Record<number, DuplicateAction>>({});
  const [uploading, setUploading] = useState(false);
  const [resolving, setResolving] = useState(false);

  async function importCsv(formData: FormData) {
    setUploading(true);
    setMessage("");
    setSkipped([]);
    setDuplicates([]);
    setDecisions({});

    const response = await fetch("/api/leads/import", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setUploading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Could not import CSV");
      return;
    }

    const nextDuplicates = data.duplicates ?? [];
    setMessage(
      nextDuplicates.length
        ? `${data.created} lead${data.created === 1 ? "" : "s"} imported. ${nextDuplicates.length} duplicate${nextDuplicates.length === 1 ? "" : "s"} need your choice.`
        : `${data.created} lead${data.created === 1 ? "" : "s"} imported to CRM`,
    );
    setSkipped(data.skipped ?? []);
    setDuplicates(nextDuplicates);
    setDecisions(Object.fromEntries(nextDuplicates.map((item: DuplicateCandidate) => [item.row, "CANCEL"])));
    onImported?.(data.leads ?? []);
  }

  async function resolveDuplicates() {
    setResolving(true);
    setMessage("");

    const response = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resolutions: duplicates.map((item) => ({
          row: item.row,
          action: decisions[item.row] ?? "CANCEL",
          existingLeadId: item.existingLead?.id,
          payload: item.payload,
        })),
      }),
    });
    const data = await response.json();
    setResolving(false);

    if (!response.ok) {
      setMessage(data.error ?? "Could not resolve duplicates");
      return;
    }

    setMessage(`${data.created ?? 0} added as duplicate, ${data.merged ?? 0} merged, ${data.cancelled ?? 0} cancelled`);
    setSkipped(data.skipped ?? []);
    setDuplicates([]);
    setDecisions({});
    onImported?.(data.leads ?? []);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white">
              <FileSpreadsheet className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>CSV Client Import</CardTitle>
              <p className="text-sm text-zinc-500">Upload outside lists from Claude, Codex, spreadsheets, or purchased research.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/templates/locallead-csv-template.csv" download>
              <Button type="button" variant="outline" size="sm">
                <Download className="h-4 w-4" />
                CSV template
              </Button>
            </a>
            <a href="/templates/locallead-csv-import-guide.pdf" download>
              <Button type="button" variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Guide PDF
              </Button>
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={importCsv} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>CSV file</Label>
            <Input name="file" type="file" accept=".csv,text/csv" required />
            <p className="text-xs text-zinc-500">Required header: businessName. Optional headers are in the template and guide.</p>
          </div>
          <Button disabled={uploading}>
            <Upload className="h-4 w-4" />
            {uploading ? "Importing..." : "Import CSV"}
          </Button>
        </form>

        {message ? <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{message}</p> : null}

        {duplicates.length ? (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-medium text-blue-950 dark:text-blue-100">Review duplicate matches</p>
                <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">Nothing below gets added unless you choose add as duplicate or merge.</p>
              </div>
              <Button type="button" disabled={resolving} onClick={resolveDuplicates}>
                <GitMerge className="h-4 w-4" />
                {resolving ? "Applying..." : "Apply choices"}
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {duplicates.map((item) => (
                <div key={item.row} className="grid gap-3 rounded-md border border-blue-200 bg-white p-3 dark:border-blue-900/60 dark:bg-zinc-950 md:grid-cols-[1fr_220px] md:items-center">
                  <div>
                    <p className="text-sm font-medium">{item.payload.businessName}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Row {item.row} · {item.reason}
                      {item.existingLead ? ` · Existing: ${item.existingLead.businessName}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {[item.payload.city, item.payload.state].filter(Boolean).join(", ") || "No location"} · {item.payload.phone ?? "No phone"} · {item.payload.website ?? "No website"}
                    </p>
                  </div>
                  <Select
                    value={decisions[item.row] ?? "CANCEL"}
                    onChange={(event) => setDecisions((current) => ({ ...current, [item.row]: event.target.value as DuplicateAction }))}
                  >
                    <option value="CANCEL">Cancel, do not add</option>
                    {item.existingLead ? <option value="MERGE">Merge into existing</option> : null}
                    <option value="ADD_COPY">Add as duplicate</option>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {skipped.length ? (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-medium">Skipped rows</p>
            <ul className="mt-2 space-y-1">
              {skipped.slice(0, 8).map((item) => (
                <li key={`${item.row}-${item.reason}`}>Row {item.row}: {item.reason}</li>
              ))}
            </ul>
            {skipped.length > 8 ? <p className="mt-2">Plus {skipped.length - 8} more.</p> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
