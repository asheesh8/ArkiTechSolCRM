import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pricingPlansSchema } from "@/lib/schemas";
import { DEFAULT_PLANS, SERVICE_PLAN } from "@/lib/pricing";

// The public pricing table, editable by owners.
//
// Owner-only rather than manager-only on purpose: this is the number on the
// website, and changing it is a business decision, not an operational one.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

async function requireOwner() {
  const user = await getCurrentUser();
  if (!user) return { error: noStore(NextResponse.json({ error: "Please sign in first." }, { status: 401 })) };
  if (!isOwner(user)) {
    return { error: noStore(NextResponse.json({ error: "Only an owner can change pricing." }, { status: 403 })) };
  }
  return { user };
}

export async function GET() {
  const caller = await requireOwner();
  if (caller.error) return caller.error;

  const rows = await prisma.pricingPlan.findMany({ orderBy: [{ group: "asc" }, { sortOrder: "asc" }] });

  // Nobody has saved yet, so hand back the same defaults the site is showing
  // rather than an empty editor that looks like the prices vanished.
  return noStore(NextResponse.json({ plans: rows.length ? rows : DEFAULT_PLANS, seeded: rows.length > 0 }));
}

export async function PUT(request: Request) {
  const caller = await requireOwner();
  if (caller.error) return caller.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStore(NextResponse.json({ error: "That request wasn't valid JSON." }, { status: 400 }));
  }

  const parsed = pricingPlansSchema.safeParse(body);
  if (!parsed.success) {
    return noStore(
      NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Those prices didn't validate." }, { status: 400 }),
    );
  }

  const { plans } = parsed.data;
  const slugs = plans.map((p) => p.slug);
  if (new Set(slugs).size !== slugs.length) {
    return noStore(NextResponse.json({ error: "Two plans share the same slug." }, { status: 400 }));
  }

  try {
    await prisma.$transaction([
      // Anything removed in the editor goes away, so the table always matches
      // exactly what was saved.
      prisma.pricingPlan.deleteMany({ where: { slug: { notIn: slugs } } }),
      ...plans.map((plan) =>
        prisma.pricingPlan.upsert({ where: { slug: plan.slug }, create: plan, update: plan }),
      ),
    ]);
  } catch (err) {
    // Left to escape, this becomes an uncaught throw, Next answers with a
    // non-JSON 500, and the editor reports whatever its browser says about
    // unparseable bodies — which is how a database problem ends up looking
    // like a typo in a price. The transaction is atomic, so on failure the
    // table still holds exactly what it held before.
    console.error("[pricing] save failed", err);
    return noStore(
      NextResponse.json(
        { error: "The prices could not be saved. Nothing was changed — please try again." },
        { status: 500 },
      ),
    );
  }

  // Push the change out now instead of waiting for the 5-minute window.
  revalidatePath("/pricing");
  for (const serviceSlug of Object.keys(SERVICE_PLAN)) revalidatePath(`/services/${serviceSlug}`);

  return noStore(NextResponse.json({ ok: true, count: plans.length }));
}
