import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invoices = await prisma.invoice.findMany({
    orderBy: { dueDate: "desc" },
    include: { client: { select: { id: true, name: true, businessName: true, email: true } } },
  });
  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { clientId, contractId, amount, dueDate, description } = body;
  if (!clientId || !amount || !dueDate) return NextResponse.json({ error: "clientId, amount, dueDate required" }, { status: 400 });
  const invoice = await prisma.invoice.create({
    data: { clientId, contractId: contractId || null, amount, dueDate: new Date(dueDate), description: description || null },
    include: { client: true },
  });
  return NextResponse.json({ invoice }, { status: 201 });
}
