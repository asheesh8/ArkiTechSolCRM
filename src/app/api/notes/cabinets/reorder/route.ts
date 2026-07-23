import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as { ids?: unknown };
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : [];
    if (!ids.length) return NextResponse.json({ error: "ids are required" }, { status: 400 });

    const existing = await prisma.noteCabinet.findMany({ select: { id: true } });
    const existingIds = new Set(existing.map((cabinet) => cabinet.id));
    const uniqueOrderedIds = Array.from(new Set(ids)).filter((id) => existingIds.has(id));
    if (uniqueOrderedIds.length !== existingIds.size) {
      return NextResponse.json({ error: "ids must include every cabinet exactly once" }, { status: 400 });
    }

    await prisma.$transaction(uniqueOrderedIds.map((id, sortOrder) => (
      prisma.noteCabinet.update({ where: { id }, data: { sortOrder } })
    )));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to reorder cabinets" }, { status: 400 });
  }
}
