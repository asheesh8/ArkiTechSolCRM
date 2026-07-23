import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Full page fetch — includes the heavy `content` field the list endpoint omits.
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const page = await prisma.notePage.findUnique({ where: { id } });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.icon === "string") data.icon = body.icon;
    if (typeof body.content === "string") data.content = body.content;
    if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
    if ("parentId" in body) data.parentId = body.parentId || null;
    if (typeof body.cabinetId === "string") data.cabinetId = body.cabinetId;

    const page = await prisma.notePage.update({
      where: { id },
      data,
      select: { id: true, title: true, icon: true, parentId: true, cabinetId: true, sortOrder: true, updatedAt: true },
    });
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update page" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    // Nested sub-pages cascade via the self-relation.
    await prisma.notePage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete page" }, { status: 400 });
  }
}
