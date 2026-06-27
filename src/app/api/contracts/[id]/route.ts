import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const contract = await prisma.contract.findUnique({ where: { id }, include: { client: true, invoices: true } });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ contract });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const contract = await prisma.contract.update({ where: { id }, data: body, include: { client: true } });
  return NextResponse.json({ contract });
}
