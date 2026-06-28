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

  // One-time checkout paid (portal pay button)
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

  // Recurring subscription invoice paid
  if (event.type === "invoice.payment_succeeded") {
    const stripeInvoice = event.data.object as any;
    const clientId = stripeInvoice.subscription_details?.metadata?.clientId
      ?? stripeInvoice.metadata?.clientId;

    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (client) {
        // Mark any matching PENDING invoice as paid, or create a record of the payment
        const existing = await prisma.invoice.findFirst({
          where: { clientId, status: "PENDING" },
          orderBy: { createdAt: "asc" },
        });

        if (existing) {
          await prisma.invoice.update({
            where: { id: existing.id },
            data: { status: "PAID", paidAt: new Date(), stripeInvoiceId: stripeInvoice.id },
          });
        } else {
          // Create a record for subsequent recurring payments
          await prisma.invoice.create({
            data: {
              clientId,
              amount: stripeInvoice.amount_paid / 100,
              dueDate: new Date(stripeInvoice.period_end * 1000),
              description: stripeInvoice.lines?.data?.[0]?.description ?? "Monthly subscription",
              status: "PAID",
              paidAt: new Date(),
              stripeInvoiceId: stripeInvoice.id,
            },
          });
        }

        await sendPaymentConfirmation({
          to: client.email,
          clientName: client.name,
          amount: stripeInvoice.amount_paid / 100,
          description: stripeInvoice.lines?.data?.[0]?.description ?? "Monthly subscription",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
