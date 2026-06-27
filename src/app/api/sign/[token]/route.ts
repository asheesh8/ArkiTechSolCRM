import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = await prisma.contract.findUnique({
    where: { signToken: token },
    include: { client: { select: { name: true, email: true, businessName: true } } },
  });
  if (!contract) return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 404 });
  return NextResponse.json({ contract });
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { signatureData } = await req.json();
  if (!signatureData) return NextResponse.json({ error: "Signature required" }, { status: 400 });

  const contract = await prisma.contract.findUnique({ where: { signToken: token }, include: { client: true } });
  if (!contract) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  if (contract.status === "SIGNED" || contract.status === "ACTIVE") {
    return NextResponse.json({ error: "Already signed" }, { status: 409 });
  }

  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: { status: "ACTIVE", signedAt: new Date(), signatureData },
  });

  // Create first invoice when contract is signed
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  await prisma.invoice.create({
    data: {
      clientId: contract.clientId,
      contractId: contract.id,
      amount: contract.total,
      dueDate,
      description: `${contract.planName} — first payment`,
      status: "PENDING",
    },
  });

  // Create magic token so client can access portal
  const { randomBytes } = await import("crypto");
  const magicToken = randomBytes(32).toString("hex");
  const magicExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.client.update({ where: { id: contract.clientId }, data: { magicToken, magicExpiry } });

  return NextResponse.json({ ok: true, contract: updated });
}
