import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Provider (staff) counter-signature. The client signs via /api/sign/[token];
// this records ArkiTech's sign-off so a contract is dual-signed.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { signatureData } = await req.json();
  if (!signatureData) return NextResponse.json({ error: "Signature required" }, { status: 400 });

  const existing = await prisma.contract.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

  const contract = await prisma.contract.update({
    where: { id },
    data: {
      providerSignatureData: signatureData,
      providerSignedAt: new Date(),
      providerName: session.name,
    },
  });

  return NextResponse.json({ contract });
}
