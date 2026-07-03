import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendContractEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const correction = await req.json().then((b) => !!b?.correction).catch(() => false);

  const { id } = await params;
  const contract = await prisma.contract.findUnique({ where: { id }, include: { client: true } });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (contract.signedAt) {
    return NextResponse.json(
      { error: "The client has already signed this contract, so it can't be resent. Cancel it and create a new one instead." },
      { status: 409 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const signUrl = `${baseUrl}/sign/${contract.signToken}`;

  await sendContractEmail({
    to: contract.client.email,
    clientName: contract.client.name,
    planName: contract.planName,
    total: contract.total,
    billingCycle: contract.billingCycle,
    signUrl,
    correction,
  });

  await prisma.contract.update({ where: { id }, data: { status: "SENT", sentAt: new Date() } });

  return NextResponse.json({ ok: true, signUrl });
}
