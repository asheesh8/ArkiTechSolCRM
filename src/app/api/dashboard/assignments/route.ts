import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Per-teammate call progress: how many leads they own, how many they've
// already worked (contacted), how many are still waiting for a first call,
// and how many calls they've logged so far this week.
export async function GET() {
  try {
    // Start of the current week (Monday 00:00 local server time).
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    const day = (weekStart.getDay() + 6) % 7; // 0 = Monday
    weekStart.setDate(weekStart.getDate() - day);

    const [users, assignedGroup, toCallGroup, callsGroup] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
      }),
      // Every assigned lead, grouped by owner.
      prisma.lead.groupBy({
        by: ["assignedToId"],
        where: { assignedToId: { not: null } },
        _count: { _all: true },
      }),
      // Leads still awaiting a first call (NEW / SAVED), grouped by owner.
      prisma.lead.groupBy({
        by: ["assignedToId"],
        where: { assignedToId: { not: null }, status: { in: ["NEW", "SAVED"] } },
        _count: { _all: true },
      }),
      // Calls logged this week, grouped by the teammate who logged them.
      prisma.callNote.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: weekStart } },
        _count: { _all: true },
      }),
    ]);

    const assignedMap = new Map(assignedGroup.map((g) => [g.assignedToId, g._count._all]));
    const toCallMap = new Map(toCallGroup.map((g) => [g.assignedToId, g._count._all]));
    const callsMap = new Map(callsGroup.map((g) => [g.userId, g._count._all]));

    const team = users
      .map((u) => {
        const assigned = assignedMap.get(u.id) ?? 0;
        const remaining = toCallMap.get(u.id) ?? 0;
        const contacted = Math.max(0, assigned - remaining);
        return {
          id: u.id,
          name: u.name,
          role: u.role,
          assigned,
          contacted,
          remaining,
          callsThisWeek: callsMap.get(u.id) ?? 0,
          progress: assigned ? Math.round((contacted / assigned) * 100) : 0,
        };
      })
      .sort((a, b) => b.assigned - a.assigned);

    return NextResponse.json({ weekStart: weekStart.toISOString(), team });
  } catch {
    return NextResponse.json({ weekStart: new Date().toISOString(), team: [], demo: true });
  }
}
