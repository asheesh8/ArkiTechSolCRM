"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Usage = {
  usedToday: number;
  dailyLimit: number;
  remainingToday: number;
  teamUsedThisMonth: number;
  monthlyFreeEstimate: number;
  teamEstimatedFreeRemainingThisMonth: number;
};

export function ScrapeQuotaWidget() {
  const [usage, setUsage] = useState<Usage | null>(null);

  async function loadUsage() {
    const response = await fetch("/api/usage/scrapes");
    if (!response.ok) return;
    const data = await response.json();
    setUsage(data.usage);
  }

  useEffect(() => {
    loadUsage();
    window.addEventListener("locallead:scrape-usage", loadUsage);
    return () => window.removeEventListener("locallead:scrape-usage", loadUsage);
  }, []);

  if (!usage) return null;

  const dailyPercent = Math.min(100, (usage.usedToday / usage.dailyLimit) * 100);
  const monthlyPercent = Math.min(100, (usage.teamUsedThisMonth / usage.monthlyFreeEstimate) * 100);

  return (
    <div className="hidden min-w-64 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-950 xl:block">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-medium">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          Scrape quota
        </span>
        <span className="font-semibold">{usage.remainingToday} left today</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${dailyPercent}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-zinc-500">
        <span>{usage.usedToday}/{usage.dailyLimit} yours</span>
        <span>{usage.teamEstimatedFreeRemainingThisMonth} est. free team searches</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-zinc-100 dark:bg-zinc-900" title="Estimated monthly Google free-tier buffer across the team">
        <div className="h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" style={{ width: `${monthlyPercent}%` }} />
      </div>
    </div>
  );
}
