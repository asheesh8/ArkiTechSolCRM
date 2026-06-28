import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSetupToken } from "@/lib/portal-auth";
import { sendPortalWelcome } from "@/lib/email";
import { stripe, getOrCreateStripeCustomer, STRIPE_PRICES } from "@/lib/stripe";

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

  const contract = await prisma.contract.findUnique({
    where: { signToken: token },
    include: { client: true },
  });
  if (!contract) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  if (contract.status === "SIGNED" || contract.status === "ACTIVE") {
    return NextResponse.json({ error: "Already signed" }, { status: 409 });
  }

  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: { status: "ACTIVE", signedAt: new Date(), signatureData },
  });

  // Create Stripe customer
  const customerId = await getOrCreateStripeCustomer(
    contract.clientId,
    contract.client.email,
    contract.client.name,
  );

  const planMeta = STRIPE_PRICES[contract.planName];

  if (planMeta?.recurring) {
    // Recurring plan → create subscription; Stripe auto-generates the first invoice
    await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planMeta.priceId }],
      metadata: { clientId: contract.clientId, contractId: contract.id },
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });
    // Record the first invoice locally so staff can see it
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    await prisma.invoice.create({
      data: {
        clientId: contract.clientId,
        contractId: contract.id,
        amount: contract.total,
        dueDate,
        description: `${contract.planName} — Month 1`,
        status: "PENDING",
      },
    });
  } else {
    // One-time plan → single invoice due in 7 days, client pays via portal checkout
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    await prisma.invoice.create({
      data: {
        clientId: contract.clientId,
        contractId: contract.id,
        amount: contract.total,
        dueDate,
        description: `${contract.planName} — payment`,
        status: "PENDING",
      },
    });
  }

  // Generate portal setup token → welcome email
  const setupToken = await createSetupToken(contract.clientId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const setupUrl = `${baseUrl}/portal/setup?token=${setupToken}`;

  await sendPortalWelcome({
    to: contract.client.email,
    name: contract.client.name,
    businessName: contract.client.businessName,
    setupUrl,
  });

  return NextResponse.json({ ok: true, contract: updated });
}
