"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Eye, Globe } from "lucide-react";
import { MetricTile } from "@/components/crm/metric-tile";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/field";

type SiteStat = { site: string; views: number; unique: number };
type DayBucket = { date: string; count: number };
type Analytics = {
  total: number;
  uniqueVisitors: number;
  daily: DayBucket[];
  sites: SiteStat[];
};

const SITE_LABELS: Record<string, string> = {
  "arkitech-landing": "ArkiTech Landing",
  "villageservers": "Village Server Initiative",
  "protech": "ProTech Contracting",
  "homeshine": "HomeSHINE",
  "petspa": "Pet Spa Grooming",
  "darkroom": "Jon's Darkroom",
  "thepit": "ThePit",
  "arkitech-crm": "ArkiTech CRM",
};

function Sparkline({ data }: { data: DayBucket[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 600;
  const h = 64;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.count / max) * (h - 8);
    return `${x},${y}`;
  });
  const area = `M${pts[0]} L${pts.join(" L")} L${w},${h} L0,${h} Z`;
  const line = `M${pts[0]} L${pts.join(" L")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 64 }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = (initial: boolean) => {
      if (initial) setLoading(true);
      fetch(`/api/track?days=${days}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled) { setData(d); setLoading(false); } });
    };

    load(true);
    const interval = setInterval(() => load(false), 4000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [days]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Site Analytics"
        description="Visitor tracking across ArkiTech sites and client-facing properties."
        actions={(
          <Select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
            className="w-40"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </Select>
        )}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricTile icon={Eye} label="Total views" value={data.total.toLocaleString()} detail={`Last ${days} days`} tone="cyan" />
            <MetricTile icon={Users} label="Unique visitors" value={data.uniqueVisitors.toLocaleString()} detail="Estimated visitor count" tone="emerald" />
            <MetricTile icon={Globe} label="Sites tracked" value={data.sites.length.toLocaleString()} detail="Active properties" tone="amber" />
            <MetricTile icon={TrendingUp} label="Avg / day" value={(data.total ? Math.round(data.total / days) : 0).toLocaleString()} detail="Daily traffic pace" tone="rose" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily page views</CardTitle>
            </CardHeader>
            <CardContent>
            {data.total === 0 ? (
              <div className="flex h-16 items-center justify-center text-sm text-zinc-400">No data yet — embed the tracker on your sites</div>
            ) : (
              <Sparkline data={data.daily} />
            )}
            <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
              <span>{data.daily[0]?.date}</span>
              <span>{data.daily[data.daily.length - 1]?.date}</span>
            </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[var(--border)]">
              <CardTitle>Breakdown by site</CardTitle>
            </CardHeader>
            {data.sites.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-zinc-400">No visits tracked yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400">Site</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400">Views</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400">Unique</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400">% Unique</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sites.map((s, i) => (
                    <tr key={s.site} className={i !== data.sites.length - 1 ? "border-b border-zinc-50 dark:border-zinc-800/50" : ""}>
                      <td className="px-5 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                        {SITE_LABELS[s.site] ?? s.site}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{s.views.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{s.unique.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-zinc-500">
                        {s.views ? Math.round((s.unique / s.views) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embed tracker on any site</CardTitle>
            </CardHeader>
            <CardContent>
            <p className="mb-3 text-xs text-[var(--muted)]">Add this script to the &lt;head&gt; of any site you want to track. Change the <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">site</code> value per property.</p>
            <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4 text-xs text-zinc-700 dark:text-zinc-300">
{`<script>
  fetch('https://arkitech-sol.vercel.app/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site: 'villageservers',        // change per site
      path: window.location.pathname,
      referrer: document.referrer,
    }),
  });
</script>`}
            </pre>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
