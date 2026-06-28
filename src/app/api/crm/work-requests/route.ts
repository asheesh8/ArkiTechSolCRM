import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.workRequest.findMany({
    include: {
      client: { select: { id: true, name: true, businessName: true, email: true } },
      files: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function PATCH(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, staffNote } = await req.json();
  const updated = await prisma.workRequest.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(staffNote !== undefined ? { staffNote } : {}),
    },
    include: { client: { select: { id: true, name: true, businessName: true } }, files: true },
  });

  return NextResponse.json({ request: updated });
}
