import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (typeof body.name === "string") data.name = body.name.trim() || "Untitled cabinet";
    if (typeof body.icon === "string") data.icon = body.icon;
    if (typeof body.color === "string") data.color = body.color;
    if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;

    const cabinet = await prisma.noteCabinet.update({ where: { id }, data });
    return NextResponse.json({ cabinet });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update cabinet" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    // Pages (and their nested children) cascade via the schema relation.
    await prisma.noteCabinet.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete cabinet" }, { status: 400 });
  }
}
