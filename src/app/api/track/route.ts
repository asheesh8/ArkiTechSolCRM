import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { site, path, referrer } = await req.json();
    if (!site) return NextResponse.json({ error: "Missing site" }, { status: 400 });

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const ua = req.headers.get("user-agent") ?? undefined;

    await prisma.pageView.create({
      data: {
        site: String(site).slice(0, 64),
        path: String(path ?? "/").slice(0, 256),
        referrer: referrer ? String(referrer).slice(0, 512) : undefined,
        ipHash,
        ua: ua?.slice(0, 256),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  const days = Math.min(Number(searchParams.get("days") ?? 30), 90);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const where = { createdAt: { gte: since }, ...(site ? { site } : {}) };

  const [total, views, sites] = await Promise.all([
    prisma.pageView.count({ where }),
    prisma.pageView.findMany({ where, select: { site: true, path: true, ipHash: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
    prisma.pageView.groupBy({ by: ["site"], where, _count: { _all: true }, orderBy: { _count: { site: "desc" } } }),
  ]);

  // unique visitors per site
  const uniqueMap: Record<string, Set<string>> = {};
  for (const v of views) {
    if (!uniqueMap[v.site]) uniqueMap[v.site] = new Set();
    uniqueMap[v.site].add(v.ipHash);
  }

  // daily buckets for sparkline
  const buckets: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of views) {
    const key = v.createdAt.toISOString().slice(0, 10);
    if (key in buckets) buckets[key]++;
  }

  const uniqueTotal = new Set(views.map((v) => v.ipHash)).size;

  return NextResponse.json({
    total,
    uniqueVisitors: uniqueTotal,
    daily: Object.entries(buckets).map(([date, count]) => ({ date, count })),
    sites: sites.map((s) => ({
      site: s.site,
      views: s._count._all,
      unique: uniqueMap[s.site]?.size ?? 0,
    })),
  });
}
