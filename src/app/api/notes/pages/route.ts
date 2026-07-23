import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const cabinetId = body.cabinetId as string;
    if (!cabinetId) return NextResponse.json({ error: "cabinetId is required" }, { status: 400 });

    const parentId = (body.parentId as string) || null;
    // New pages land at the bottom of their sibling group.
    const siblings = await prisma.notePage.count({ where: { cabinetId, parentId } });

    const page = await prisma.notePage.create({
      data: {
        cabinetId,
        parentId,
        title: (body.title as string)?.trim() || "Untitled",
        icon: (body.icon as string) || "📄",
        sortOrder: siblings,
        createdById: user.id,
      },
      select: { id: true, title: true, icon: true, parentId: true, cabinetId: true, sortOrder: true, updatedAt: true },
    });
    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create page" }, { status: 400 });
  }
}
