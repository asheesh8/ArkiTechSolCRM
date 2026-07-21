import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isManager } from "@/lib/auth";

// Bulk-assign (or unassign) many leads to one teammate at once.
// Managers only — agents can't reassign work.
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    if (!isManager(user)) return NextResponse.json({ error: "Only managers can assign leads." }, { status: 403 });

    const { ids, assignedToId } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Select at least one lead to assign." }, { status: 400 });
    }

    // assignedToId may be null (unassign) or a valid user id.
    if (assignedToId) {
      const target = await prisma.user.findUnique({ where: { id: assignedToId }, select: { id: true } });
      if (!target) return NextResponse.json({ error: "That teammate no longer exists." }, { status: 400 });
    }

    const result = await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { assignedToId: assignedToId || null },
    });

    return NextResponse.json({ count: result.count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to assign leads" }, { status: 400 });
  }
}
