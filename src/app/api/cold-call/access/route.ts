import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isOwner } from "@/lib/auth";
import {
  COLD_CALL_ACCESS_CABINET_ID,
  replaceColdCallViewers,
} from "@/lib/cold-call-access";
import { prisma } from "@/lib/prisma";

const accessSchema = z.object({
  userIds: z.array(z.string().min(1)).max(100),
});

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(currentUser)) {
    return NextResponse.json({ error: "Owner access is required." }, { status: 403 });
  }

  const [users, shares] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.noteCabinetShare.findMany({
      where: { cabinetId: COLD_CALL_ACCESS_CABINET_ID },
      select: { userId: true },
    }),
  ]);

  return NextResponse.json({
    users,
    userIds: shares.map((share) => share.userId),
  });
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(currentUser)) {
    return NextResponse.json({ error: "Owner access is required." }, { status: 403 });
  }

  const parsed = accessSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid set of teammates." }, { status: 400 });
  }

  const userIds = await replaceColdCallViewers(currentUser.id, parsed.data.userIds);
  return NextResponse.json({ userIds });
}
