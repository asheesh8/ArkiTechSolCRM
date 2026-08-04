import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const row = await prisma.client.findUnique({
    where: { id },
    include: { contracts: true, invoices: true, workRequests: true },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Portal credentials never leave the server — the CRM only needs the state.
  const { passwordHash, sessionToken, sessionExpiry, setupToken, setupExpiry, ...client } = row;
  return NextResponse.json({
    client: {
      ...client,
      portalStatus: passwordHash ? "ACTIVE" : setupToken && setupExpiry && setupExpiry > new Date() ? "INVITED" : "NONE",
    },
  });
}

// Removes an onboarded client outright. Contracts, invoices, and work requests
// cascade with them — used to clear out test or duplicate onboardings.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(session)) {
    return NextResponse.json({ error: "Only an owner can delete a client" }, { status: 403 });
  }

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      businessName: true,
      _count: { select: { contracts: true, invoices: true, workRequests: true } },
    },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.client.delete({ where: { id } });

  return NextResponse.json({ ok: true, businessName: client.businessName, removed: client._count });
}
