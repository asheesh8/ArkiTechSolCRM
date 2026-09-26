import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isManager } from "@/lib/auth";

/**
 * Delete many leads at once, from the selection on the clients table.
 * Managers only, same as bulk assign.
 *
 * This is permanent: a lead's call notes go with it (cascade), and any
 * PageSpeed audit run on it is kept but unlinked. Two things are refused
 * rather than silently destroyed:
 *
 *   * leads that were onboarded as clients, because the client record,
 *     its contracts and its invoices hang off them
 *   * more than MAX_PER_CALL at once, so a runaway call can't empty the
 *     table in one request
 *
 * The response reports what went and what was skipped, so the UI can say so.
 */
const MAX_PER_CALL = 500;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    if (!isManager(user)) {
      return NextResponse.json({ error: "Only managers can delete leads." }, { status: 403 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Select at least one company to delete." }, { status: 400 });
    }
    if (ids.length > MAX_PER_CALL) {
      return NextResponse.json(
        { error: `That's ${ids.length} at once. Delete up to ${MAX_PER_CALL} at a time.` },
        { status: 400 },
      );
    }

    const onboarded = await prisma.client.findMany({
      where: { leadId: { in: ids } },
      select: { leadId: true, businessName: true },
    });
    const protectedIds = new Set(onboarded.map((c) => c.leadId).filter((id): id is string => !!id));
    const deletable = ids.filter((id: string) => !protectedIds.has(id));

    const result = deletable.length
      ? await prisma.lead.deleteMany({ where: { id: { in: deletable } } })
      : { count: 0 };

    return NextResponse.json({
      count: result.count,
      skipped: onboarded.map((c) => ({ id: c.leadId, businessName: c.businessName })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete those leads" },
      { status: 400 },
    );
  }
}
