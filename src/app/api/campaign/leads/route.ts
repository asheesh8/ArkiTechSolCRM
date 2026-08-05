import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { CAMPAIGN_SITE, CAMPAIGN_SOURCE } from "@/lib/campaign";

// Everything the Ad Campaign tab shows: the leads the paid landing page
// produced, plus the traffic it took to produce them. Owner-only — this is
// spend and pipeline data, not something the whole team needs.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(user)) {
    return NextResponse.json({ error: "Owner access is required." }, { status: 403 });
  }

  const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get("days") ?? 30), 1), 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1_000);

  const [leads, views, demoSessions] = await Promise.all([
    prisma.lead.findMany({
      where: { source: CAMPAIGN_SOURCE },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        businessName: true,
        phone: true,
        email: true,
        city: true,
        status: true,
        notes: true,
        createdAt: true,
        assignedTo: { select: { id: true, name: true } },
      },
    }),
    prisma.pageView.findMany({
      where: { site: CAMPAIGN_SITE, createdAt: { gte: since } },
      select: { path: true, ipHash: true, createdAt: true },
    }),
    // Demo starts aren't attributable to the landing page specifically, but
    // they move in lockstep with it while a campaign is the only traffic.
    prisma.voiceDemoSession.count({ where: { createdAt: { gte: since } } }).catch(() => 0),
  ]);

  const uniqueVisitors = new Set(views.map((view) => view.ipHash)).size;
  const leadsInWindow = leads.filter((lead) => lead.createdAt >= since).length;

  // Which ad/creative each visit carried, read back off the tracked path.
  const byCreative = new Map<string, number>();
  for (const view of views) {
    const query = view.path.split("?")[1];
    const label = query
      ? new URLSearchParams(query).get("utm_content")
        ?? new URLSearchParams(query).get("utm_campaign")
        ?? "Untagged"
      : "Direct / untagged";
    byCreative.set(label, (byCreative.get(label) ?? 0) + 1);
  }

  return NextResponse.json({
    days,
    totals: {
      leadsAllTime: leads.length,
      leadsInWindow,
      views: views.length,
      uniqueVisitors,
      demoSessions,
      // Leads per unique visitor is the number that decides whether the ad
      // spend is working, so it's computed here rather than in the UI.
      conversionRate: uniqueVisitors ? leadsInWindow / uniqueVisitors : 0,
    },
    creatives: [...byCreative.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    leads,
  });
}
