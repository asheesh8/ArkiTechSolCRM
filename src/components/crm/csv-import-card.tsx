"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";

type CsvImportCardProps = {
  onImported?: (leads: any[]) => void;
};

export function CsvImportCard({ onImported }: CsvImportCardProps) {
  const [message, setMessage] = useState("");
  const [skipped, setSkipped] = useState<{ row: number; reason: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  async function importCsv(formData: FormData) {
    setUploading(true);
    setMessage("");
    setSkipped([]);

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

    setMessage(`${data.created} lead${data.created === 1 ? "" : "s"} imported to CRM`);
    setSkipped(data.skipped ?? []);
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
