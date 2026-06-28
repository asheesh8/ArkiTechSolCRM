import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});

// Stripe price IDs — test mode. Swap for live IDs in production env vars.
export const STRIPE_PRICES: Record<string, { priceId: string; recurring: boolean }> = {
  Basic:            { priceId: "price_1TnMsnKPZFsO7CExtPHbEKL2", recurring: true },
  Standard:         { priceId: "price_1TnMsnKPZFsO7CExEWxbuWVZ", recurring: true },
  "One-Time Build": { priceId: "price_1TnMsoKPZFsO7CExb3Smdjw5", recurring: false },
  "Edit / Add-on":  { priceId: "price_1TnMsoKPZFsO7CEx5vRKcOdp", recurring: false },
};

export async function getOrCreateStripeCustomer(clientId: string, email: string, name: string) {
  const { prisma } = await import("@/lib/prisma");
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (client?.stripeCustomerId) return client.stripeCustomerId;

  const customer = await stripe.customers.create({ email, name, metadata: { clientId } });
  await prisma.client.update({ where: { id: clientId }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}
