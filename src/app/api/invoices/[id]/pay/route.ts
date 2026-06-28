import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPortalSession } from "@/lib/portal-auth";
import { stripe, getOrCreateStripeCustomer, STRIPE_PRICES } from "@/lib/stripe";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const crmUser = await getCurrentUser();
  const portalClient = await getPortalSession();
  if (!crmUser && !portalClient) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, contract: { select: { planName: true } } },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (portalClient && invoice.clientId !== portalClient.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const customerId = await getOrCreateStripeCustomer(
    invoice.clientId,
    invoice.client.email,
    invoice.client.name,
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const planName = invoice.contract?.planName ?? "";
  const planMeta = STRIPE_PRICES[planName];

  // Use the catalog price ID if it matches the amount exactly, otherwise use inline price_data
  const lineItem = planMeta && !planMeta.recurring
    ? { price: planMeta.priceId, quantity: 1 }
    : {
        price_data: {
          currency: "usd",
          product_data: { name: invoice.description ?? "ArkiTech Services" },
          unit_amount: Math.round(invoice.amount * 100),
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [lineItem],
    success_url: `${baseUrl}/portal/invoices?paid=1`,
    cancel_url: `${baseUrl}/portal/invoices`,
    metadata: { invoiceId: id },
  });

  return NextResponse.json({ url: session.url });
}
