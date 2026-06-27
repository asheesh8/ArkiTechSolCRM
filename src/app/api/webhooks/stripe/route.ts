import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const invoiceId = session.metadata?.invoiceId;
    if (invoiceId) {
      const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID", paidAt: new Date(), stripeInvoiceId: session.id },
        include: { client: true },
      });
      await sendPaymentConfirmation({
        to: invoice.client.email,
        clientName: invoice.client.name,
        amount: invoice.amount,
        description: invoice.description ?? "ArkiTech Services",
      });
    }
  }

  return NextResponse.json({ received: true });
}
