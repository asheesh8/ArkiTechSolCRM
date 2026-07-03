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

// Only these contract fields can be edited in place.
const EDITABLE = ["planName", "lineItems", "subtotal", "tax", "total", "billingCycle", "notes", "documentKey", "documentName"] as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.contract.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Editable until the client signs. Our own (provider) signature doesn't lock it.
  if (existing.signedAt) {
    return NextResponse.json({ error: "The client has already signed this contract, so it can't be edited. Cancel it and create a new one instead." }, { status: 409 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of EDITABLE) {
    if (key in body) data[key] = body[key];
  }
  // If we'd already counter-signed, that signature was on the old terms — clear it so we re-sign.
  if (existing.providerSignedAt) {
    data.providerSignatureData = null;
    data.providerSignedAt = null;
    data.providerName = null;
  }

  const contract = await prisma.contract.update({ where: { id }, data, include: { client: true } });
  return NextResponse.json({ contract });
}
