import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const client = await getPortalSession();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const requests = await prisma.workRequest.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    include: { files: true },
  });
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  const client = await getPortalSession();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, description } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const request = await prisma.workRequest.create({
    data: { clientId: client.id, title, description: description || null },
    include: { files: true },
  });
  return NextResponse.json({ request }, { status: 201 });
}
