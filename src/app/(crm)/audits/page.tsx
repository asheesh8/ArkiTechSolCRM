"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";
import { ScoreCard } from "@/components/crm/score-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";

export default function AuditsPage() {
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function run(formData: FormData) {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/pagespeed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: formData.get("url"), strategy: formData.get("strategy") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMessage(data.error ?? "Audit failed");
    setAudit(data.audit);
    setMessage(data.warning ?? "Audit complete");
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">PageSpeed Audit</h2>
        <p className="mt-1 text-sm text-zinc-500">Run Google PageSpeed Insights for mobile or desktop and save scores to selected leads through the API.</p>
      </section>

      <Card>
        <CardHeader><CardTitle>Run Audit</CardTitle></CardHeader>
        <CardContent>
          <form action={run} className="grid gap-4 md:grid-cols-[1fr_180px_140px]">
            <div className="space-y-2"><Label>URL</Label><Input name="url" type="url" defaultValue="https://example.com" required /></div>
            <div className="space-y-2"><Label>Strategy</Label><Select name="strategy" defaultValue="mobile"><option value="mobile">Mobile</option><option value="desktop">Desktop</option></Select></div>
            <div className="flex items-end"><Button disabled={loading} className="w-full"><Gauge className="h-4 w-4" /> {loading ? "Running..." : "Run"}</Button></div>
          </form>
          {message ? <p className="mt-4 text-sm text-zinc-500">{message}</p> : null}
        </CardContent>
      </Card>

      {audit ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <ScoreCard label="Performance" value={audit.performance} />
            <ScoreCard label="Accessibility" value={audit.accessibility} />
            <ScoreCard label="SEO" value={audit.seo} />
            <ScoreCard label="Best Practices" value={audit.bestPractices} />
          </section>
          <section className="grid gap-6 xl:grid-cols-2">
            <Card><CardHeader><CardTitle>Core Web Vitals</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <p>First Contentful Paint<br /><strong>{audit.firstContentfulPaint ?? "--"}</strong></p>
              <p>Largest Contentful Paint<br /><strong>{audit.largestContentfulPaint ?? "--"}</strong></p>
              <p>Speed Index<br /><strong>{audit.speedIndex ?? "--"}</strong></p>
              <p>Total Blocking Time<br /><strong>{audit.totalBlockingTime ?? "--"}</strong></p>
              <p>Cumulative Layout Shift<br /><strong>{audit.cumulativeLayoutShift ?? "--"}</strong></p>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Top Opportunities</CardTitle></CardHeader><CardContent className="space-y-3">
              {(audit.opportunities ?? []).slice(0, 5).map((item: any, index: number) => (
                <div key={`${item.title}-${index}`} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
                  {item.savings ? <p className="mt-2 text-xs text-emerald-600">{item.savings}</p> : null}
                </div>
              ))}
            </CardContent></Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
