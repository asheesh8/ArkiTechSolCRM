import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});

export async function getOrCreateStripeCustomer(clientId: string, email: string, name: string) {
  const { prisma } = await import("@/lib/prisma");
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (client?.stripeCustomerId) return client.stripeCustomerId;

  const customer = await stripe.customers.create({ email, name, metadata: { clientId } });
  await prisma.client.update({ where: { id: clientId }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}
