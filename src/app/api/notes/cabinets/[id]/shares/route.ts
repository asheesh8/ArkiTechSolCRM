import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";

// Manage which teammates a cabinet is delegated to. Owner-only: owners already
// see every cabinet, so sharing is purely about granting non-owners access.

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(user)) return NextResponse.json({ error: "Owner access is required." }, { status: 403 });

  const { id } = await params;
  const shares = await prisma.noteCabinetShare.findMany({ where: { cabinetId: id }, select: { userId: true } });
  return NextResponse.json({ userIds: shares.map((s) => s.userId) });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(user)) return NextResponse.json({ error: "Owner access is required." }, { status: 403 });

  const { id } = await params;
  const cabinet = await prisma.noteCabinet.findUnique({ where: { id }, select: { id: true } });
  if (!cabinet) return NextResponse.json({ error: "Cabinet not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const requested: string[] = Array.isArray(body.userIds)
    ? body.userIds.filter((x: unknown): x is string => typeof x === "string")
    : [];

  // Only non-owners are meaningful share targets (owners already see everything).
  const targets = await prisma.user.findMany({
    where: { id: { in: requested }, role: { not: "OWNER" }, isActive: true },
    select: { id: true },
  });
  const userIds = targets.map((u) => u.id);

  // Replace the whole member set atomically.
  await prisma.$transaction([
    prisma.noteCabinetShare.deleteMany({ where: { cabinetId: id } }),
    ...(userIds.length
      ? [prisma.noteCabinetShare.createMany({ data: userIds.map((userId) => ({ cabinetId: id, userId })), skipDuplicates: true })]
      : []),
  ]);

  return NextResponse.json({ userIds });
}
