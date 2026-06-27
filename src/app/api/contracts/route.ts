import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { clientId, planName, lineItems, subtotal, tax, total, billingCycle, notes } = body;
  if (!clientId || !planName || !lineItems || total == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const signToken = randomBytes(24).toString("hex");
  const contract = await prisma.contract.create({
    data: {
      clientId,
      planName,
      lineItems,
      subtotal: subtotal ?? total,
      tax: tax ?? 0,
      total,
      billingCycle: billingCycle ?? "MONTHLY",
      notes: notes || null,
      signToken,
      status: "DRAFT",
    },
    include: { client: true },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
