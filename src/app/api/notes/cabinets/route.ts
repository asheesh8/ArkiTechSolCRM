import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Notes are a team-shared workspace, so every signed-in staff member sees the
// same cabinets and pages — mirroring how leads/clients are shared in Neon.

const PAGE_SELECT = {
  id: true,
  title: true,
  icon: true,
  parentId: true,
  sortOrder: true,
  updatedAt: true,
} as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cabinets = await prisma.noteCabinet.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      pages: { select: PAGE_SELECT, orderBy: { sortOrder: "asc" } },
    },
  });
  return NextResponse.json({ cabinets });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const count = await prisma.noteCabinet.count();
    const cabinet = await prisma.noteCabinet.create({
      data: {
        name: (body.name as string)?.trim() || "New cabinet",
        icon: (body.icon as string) || "📁",
        color: (body.color as string) || "blue",
        sortOrder: count,
        createdById: user.id,
        // Seed a first page so the cabinet opens onto a writable surface.
        pages: { create: { title: "Untitled", icon: "📄", createdById: user.id } },
      },
      include: { pages: { select: PAGE_SELECT, orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ cabinet }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create cabinet" }, { status: 400 });
  }
}
