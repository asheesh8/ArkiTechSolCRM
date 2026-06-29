"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Eye, Globe } from "lucide-react";

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
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={line} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950">
        <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      </div>
      <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-xs font-medium text-zinc-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </div>
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
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Site Analytics</h1>
          <p className="mt-1 text-sm text-zinc-500">Visitor tracking across all ArkiTech properties</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Eye} label="Total page views" value={data.total} sub={`last ${days} days`} />
            <StatCard icon={Users} label="Unique visitors" value={data.uniqueVisitors} />
            <StatCard icon={Globe} label="Sites tracked" value={data.sites.length} />
            <StatCard icon={TrendingUp} label="Avg / day" value={data.total ? Math.round(data.total / days) : 0} />
          </div>

          {/* Sparkline */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Daily page views</p>
            {data.total === 0 ? (
              <div className="flex h-16 items-center justify-center text-sm text-zinc-400">No data yet — embed the tracker on your sites</div>
            ) : (
              <Sparkline data={data.daily} />
            )}
            <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
              <span>{data.daily[0]?.date}</span>
              <span>{data.daily[data.daily.length - 1]?.date}</span>
            </div>
          </div>

          {/* Per-site table */}
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Breakdown by site</p>
            </div>
            {data.sites.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-zinc-400">No visits tracked yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Site</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Views</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Unique</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">% Unique</th>
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
          </div>

          {/* Embed snippet */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Embed tracker on any site</p>
            <p className="mb-3 text-xs text-zinc-500">Add this script to the &lt;head&gt; of any site you want to track. Change the <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">site</code> value per property.</p>
            <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
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
          </div>
        </>
      ) : null}
    </div>
  );
}
