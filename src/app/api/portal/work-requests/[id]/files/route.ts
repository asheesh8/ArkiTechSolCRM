import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await getPortalSession();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const request = await prisma.workRequest.findFirst({ where: { id, clientId: client.id } });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, r2Key, size, mimeType } = await req.json();
  if (!name || !r2Key || size == null) return NextResponse.json({ error: "name, r2Key, size required" }, { status: 400 });

  const file = await prisma.workFile.create({ data: { workRequestId: id, name, r2Key, size: BigInt(size), mimeType: mimeType || null } });
  return NextResponse.json({ file: { ...file, size: file.size.toString() } }, { status: 201 });
}
