import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const entryInclude = {
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OwnerWorkLogInclude;

type EntryWithUser = Prisma.OwnerWorkLogGetPayload<{ include: typeof entryInclude }>;

function durationSeconds(entry: Pick<EntryWithUser, "startedAt" | "endedAt">) {
  const end = entry.endedAt ?? new Date();
  return Math.max(0, Math.round((end.getTime() - entry.startedAt.getTime()) / 1000));
}

function serializeEntry(entry: EntryWithUser) {
  return {
    id: entry.id,
    startedAt: entry.startedAt.toISOString(),
    endedAt: entry.endedAt?.toISOString() ?? null,
    workSummary: entry.workSummary ?? "",
    durationSeconds: durationSeconds(entry),
    user: entry.user,
  };
}

function cleanSummary(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 2_000) : "";
}

function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function startOfWeek() {
  const date = startOfDay();
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date;
}

function startOfMonth() {
  const date = startOfDay();
  date.setDate(1);
  return date;
}

function dateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseRequestedRange(searchParams: URLSearchParams) {
  const timeMin = parseIsoDate(searchParams.get("timeMin"));
  const timeMax = parseIsoDate(searchParams.get("timeMax"));
  if (!timeMin || !timeMax || timeMin >= timeMax) return null;

  const maxRangeMs = 45 * 24 * 60 * 60 * 1000;
  if (timeMax.getTime() - timeMin.getTime() > maxRangeMs) return null;

  return { timeMin, timeMax };
}

function normalizeManualRange(startedAt: Date, endedAt: Date) {
  const normalizedEndedAt = new Date(endedAt);
  if (normalizedEndedAt < startedAt) normalizedEndedAt.setDate(normalizedEndedAt.getDate() + 1);
  return { startedAt, endedAt: normalizedEndedAt };
}

function buildInsights(ownerUsers: Array<{ id: string; name: string; email: string }>, entries: EntryWithUser[]) {
  const todayStart = startOfDay();
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  const last7Start = addDays(todayStart, -6);

  const todayByUser = ownerUsers.reduce<Record<string, { name: string; email: string; seconds: number }>>((acc, ownerUser) => {
    acc[ownerUser.id] = { name: ownerUser.name, email: ownerUser.email, seconds: 0 };
    return acc;
  }, {});

  const ownerBreakdown = ownerUsers.reduce<Record<string, { name: string; email: string; seconds: number; sessions: number; documentedSessions: number }>>((acc, ownerUser) => {
    acc[ownerUser.id] = { name: ownerUser.name, email: ownerUser.email, seconds: 0, sessions: 0, documentedSessions: 0 };
    return acc;
  }, {});

  const dayBuckets = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(last7Start, index);
    return {
      key: dateKey(date),
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      seconds: 0,
    };
  });
  const dayBucketMap = new Map(dayBuckets.map((day) => [day.key, day]));

  let todaySeconds = 0;
  let weekSeconds = 0;
  let monthSeconds = 0;
  let completedSeconds = 0;
  let completedCount = 0;
  let documentedCount = 0;

  for (const entry of entries) {
    const seconds = durationSeconds(entry);
    const hasSummary = cleanSummary(entry.workSummary).length > 0;

    if (entry.startedAt >= todayStart) {
      todaySeconds += seconds;
      todayByUser[entry.user.id] ??= { name: entry.user.name, email: entry.user.email, seconds: 0 };
      todayByUser[entry.user.id].seconds += seconds;
    }

    if (entry.startedAt >= weekStart) {
      weekSeconds += seconds;
      ownerBreakdown[entry.user.id] ??= { name: entry.user.name, email: entry.user.email, seconds: 0, sessions: 0, documentedSessions: 0 };
      ownerBreakdown[entry.user.id].seconds += seconds;
      ownerBreakdown[entry.user.id].sessions += 1;
      if (hasSummary) ownerBreakdown[entry.user.id].documentedSessions += 1;
    }

    if (entry.startedAt >= monthStart) monthSeconds += seconds;

    if (entry.startedAt >= last7Start) {
      const bucket = dayBucketMap.get(dateKey(entry.startedAt));
      if (bucket) bucket.seconds += seconds;
    }

    if (entry.endedAt) {
      completedCount += 1;
      completedSeconds += seconds;
    }
    if (hasSummary) documentedCount += 1;
  }

  const documentedPercent = entries.length ? Math.round((documentedCount / entries.length) * 100) : 0;
  const completedPercent = entries.length ? Math.round((completedCount / entries.length) * 100) : 0;
  const averageSessionSeconds = completedCount ? Math.round(completedSeconds / completedCount) : 0;
  const maxDaySeconds = Math.max(1, ...dayBuckets.map((day) => day.seconds));

  let streakDays = 0;
  for (let offset = 0; offset < 30; offset += 1) {
    const key = dateKey(addDays(todayStart, -offset));
    const hasWork = entries.some((entry) => dateKey(entry.startedAt) === key && durationSeconds(entry) > 0);
    if (!hasWork) break;
    streakDays += 1;
  }

  const productivityScore = entries.length
    ? Math.round(
        documentedPercent * 0.45
        + completedPercent * 0.25
        + Math.min(weekSeconds / (10 * 60 * 60), 1) * 20
        + Math.min(streakDays / 5, 1) * 10,
      )
    : 0;

  return {
    todaySeconds,
    weekSeconds,
    monthSeconds,
    averageSessionSeconds,
    documentedPercent,
    completedPercent,
    productivityScore,
    productivityLabel: productivityScore >= 80 ? "Dialed in" : productivityScore >= 55 ? "Building momentum" : productivityScore > 0 ? "Needs detail" : "No time logged",
    streakDays,
    sessionCount: entries.length,
    completedCount,
    todayByUser,
    ownerBreakdown: Object.values(ownerBreakdown).sort((a, b) => b.seconds - a.seconds),
    last7Days: dayBuckets.map((day) => ({
      ...day,
      percent: Math.round((day.seconds / maxDaySeconds) * 100),
    })),
  };
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isOwner(user)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const requestedRange = parseRequestedRange(searchParams);
    const todayStart = startOfDay();
    const analyticsStart = new Date(Math.min(startOfWeek().getTime(), startOfMonth().getTime(), addDays(todayStart, -29).getTime()));

    const [ownerUsers, activeEntry, recentEntries, insightEntries, calendarEntries] = await Promise.all([
      prisma.user.findMany({
        where: { role: "OWNER", isActive: true },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
      prisma.ownerWorkLog.findFirst({
        where: { userId: user.id, endedAt: null },
        include: entryInclude,
        orderBy: { startedAt: "desc" },
      }),
      prisma.ownerWorkLog.findMany({
        where: { user: { role: "OWNER", isActive: true } },
        include: entryInclude,
        orderBy: { startedAt: "desc" },
        take: 18,
      }),
      prisma.ownerWorkLog.findMany({
        where: { startedAt: { gte: analyticsStart }, user: { role: "OWNER", isActive: true } },
        include: entryInclude,
        orderBy: { startedAt: "desc" },
      }),
      requestedRange
        ? prisma.ownerWorkLog.findMany({
            where: {
              startedAt: { lt: requestedRange.timeMax },
              user: { role: "OWNER", isActive: true },
              OR: [{ endedAt: null }, { endedAt: { gt: requestedRange.timeMin } }],
            },
            include: entryInclude,
            orderBy: { startedAt: "asc" },
          })
        : Promise.resolve([] as EntryWithUser[]),
    ]);

    const insights = buildInsights(ownerUsers, insightEntries);

    return NextResponse.json({
      viewerId: user.id,
      activeEntry: activeEntry ? serializeEntry(activeEntry) : null,
      recentEntries: recentEntries.map(serializeEntry),
      calendarEntries: calendarEntries.map(serializeEntry),
      todayByUser: insights.todayByUser,
      insights,
    });
  } catch (error) {
    console.error("Owner work log GET failed", error);
    return NextResponse.json({ error: "Could not load owner work log" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isOwner(user)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "clock-in") {
      const activeEntry = await prisma.ownerWorkLog.findFirst({
        where: { userId: user.id, endedAt: null },
        include: entryInclude,
        orderBy: { startedAt: "desc" },
      });
      if (activeEntry) return NextResponse.json({ activeEntry: serializeEntry(activeEntry) });

      const created = await prisma.ownerWorkLog.create({
        data: { userId: user.id },
        include: entryInclude,
      });
      return NextResponse.json({ activeEntry: serializeEntry(created) }, { status: 201 });
    }

    if (action === "clock-out") {
      const activeEntry = await prisma.ownerWorkLog.findFirst({
        where: { userId: user.id, endedAt: null },
        orderBy: { startedAt: "desc" },
      });
      if (!activeEntry) return NextResponse.json({ error: "No active clock-in found" }, { status: 400 });

      const summary = cleanSummary(body.workSummary);
      const updated = await prisma.ownerWorkLog.update({
        where: { id: activeEntry.id },
        data: { endedAt: new Date(), workSummary: summary || null },
        include: entryInclude,
      });
      return NextResponse.json({ entry: serializeEntry(updated) });
    }

    if (action === "manual-entry") {
      const rawStartedAt = parseIsoDate(body.startedAt);
      const rawEndedAt = parseIsoDate(body.endedAt);
      const summary = cleanSummary(body.workSummary);

      if (!rawStartedAt || !rawEndedAt) return NextResponse.json({ error: "Start and end times are required" }, { status: 400 });
      const { startedAt, endedAt } = normalizeManualRange(rawStartedAt, rawEndedAt);
      if (startedAt >= endedAt) return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
      if (endedAt.getTime() > Date.now() + 5 * 60 * 1000) return NextResponse.json({ error: "Manual work cannot end in the future" }, { status: 400 });
      if (durationSeconds({ startedAt, endedAt }) > 24 * 60 * 60) return NextResponse.json({ error: "Manual work entries must be 24 hours or less" }, { status: 400 });
      if (!summary) return NextResponse.json({ error: "Add a short note about what got done" }, { status: 400 });

      const overlapping = await prisma.ownerWorkLog.findFirst({
        where: {
          userId: user.id,
          startedAt: { lt: endedAt },
          OR: [{ endedAt: null }, { endedAt: { gt: startedAt } }],
        },
        select: { id: true },
      });
      if (overlapping) return NextResponse.json({ error: "That overlaps with another work log" }, { status: 400 });

      const created = await prisma.ownerWorkLog.create({
        data: { userId: user.id, startedAt, endedAt, workSummary: summary },
        include: entryInclude,
      });
      return NextResponse.json({ entry: serializeEntry(created) }, { status: 201 });
    }

    return NextResponse.json({ error: "Unsupported work log action" }, { status: 400 });
  } catch (error) {
    console.error("Owner work log POST failed", error);
    return NextResponse.json({ error: "Could not update owner work log" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isOwner(user)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Work log id is required" }, { status: 400 });

    const existing = await prisma.ownerWorkLog.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) return NextResponse.json({ error: "Work log not found" }, { status: 404 });
    if (existing.userId !== user.id) return NextResponse.json({ error: "You can only edit your own work log" }, { status: 403 });

    const summary = cleanSummary(body.workSummary);
    const data: Prisma.OwnerWorkLogUpdateInput = { workSummary: summary || null };

    if (body.startedAt !== undefined || body.endedAt !== undefined) {
      const rawStartedAt = parseIsoDate(body.startedAt);
      const rawEndedAt = parseIsoDate(body.endedAt);
      if (!rawStartedAt || !rawEndedAt) return NextResponse.json({ error: "Start and end times are required" }, { status: 400 });

      const { startedAt, endedAt } = normalizeManualRange(rawStartedAt, rawEndedAt);
      if (startedAt >= endedAt) return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
      if (endedAt.getTime() > Date.now() + 5 * 60 * 1000) return NextResponse.json({ error: "Work log cannot end in the future" }, { status: 400 });
      if (durationSeconds({ startedAt, endedAt }) > 24 * 60 * 60) return NextResponse.json({ error: "Work log entries must be 24 hours or less" }, { status: 400 });

      const overlapping = await prisma.ownerWorkLog.findFirst({
        where: {
          id: { not: id },
          userId: user.id,
          startedAt: { lt: endedAt },
          OR: [{ endedAt: null }, { endedAt: { gt: startedAt } }],
        },
        select: { id: true },
      });
      if (overlapping) return NextResponse.json({ error: "That overlaps with another work log" }, { status: 400 });

      data.startedAt = startedAt;
      data.endedAt = endedAt;
    }

    const updated = await prisma.ownerWorkLog.update({
      where: { id },
      data,
      include: entryInclude,
    });

    return NextResponse.json({ entry: serializeEntry(updated) });
  } catch (error) {
    console.error("Owner work log PATCH failed", error);
    return NextResponse.json({ error: "Could not save owner work log" }, { status: 500 });
  }
}
