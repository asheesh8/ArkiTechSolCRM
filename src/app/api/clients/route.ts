import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (email) {
    const client = await prisma.client.findUnique({ where: { email: email.toLowerCase().trim() } });
    return NextResponse.json({ clients: client ? [client] : [] });
  }
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { contracts: { where: { status: "ACTIVE" }, take: 1 }, invoices: { where: { status: "PENDING" }, take: 1 } },
  });
  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { leadId, name, email, phone, businessName } = body;
  if (!name || !email || !businessName) return NextResponse.json({ error: "name, email, businessName required" }, { status: 400 });

  const existing = await prisma.client.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "A client with this email already exists" }, { status: 409 });

  const client = await prisma.client.create({
    data: { leadId: leadId || null, name, email, phone: phone || null, businessName },
  });
  return NextResponse.json({ client }, { status: 201 });
}
