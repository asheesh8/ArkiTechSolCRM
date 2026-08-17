import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { checkPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

// Give a dialled number somewhere to live.
//
// Cold calling runs ahead of the CRM: a rep dials a number off a van, or works
// a switchboard to reach an owner, and neither number is on file yet. Without
// this the wrap-up has nowhere to save and the call is lost. Two ways out —
// start a lead from the number, or hang the number on a business that already
// exists because it is how you got through to them.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

const LEAD_FIELDS = {
  id: true,
  businessName: true,
  phone: true,
  city: true,
  state: true,
  category: true,
} as const;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return noStore(NextResponse.json({ error: "Please sign in first." }, { status: 401 }));
  }

  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) {
    return noStore(NextResponse.json({ error: "You don't have access to the outreach room." }, { status: 403 }));
  }

  const body = (await request.json().catch(() => ({}))) as {
    mode?: string;
    phone?: string;
    leadId?: string;
    businessName?: string;
    city?: string;
    category?: string;
  };

  const phone = checkPhone(body.phone ?? "");
  if (!phone.e164) {
    return noStore(NextResponse.json({ error: phone.reason || "That isn't a usable number." }, { status: 400 }));
  }

  // ── Start a new lead from the number ────────────────────────────────────
  if (body.mode === "create") {
    const businessName = body.businessName?.trim();
    if (!businessName) {
      return noStore(
        NextResponse.json({ error: "Give the business a name.", field: "businessName" }, { status: 400 }),
      );
    }

    const lead = await prisma.lead.create({
      data: {
        businessName,
        phone: phone.e164,
        city: body.city?.trim() || null,
        category: body.category?.trim() || null,
        // Dialled first, filed second — this is a lead because someone called
        // it, not because it came out of the scraper.
        source: "cold-call",
        status: "CALLED",
        assignedToId: user.id,
      },
      select: LEAD_FIELDS,
    });

    return noStore(NextResponse.json({ lead, created: true }));
  }

  // ── Record the number against a business already on file ────────────────
  if (body.mode === "attach") {
    const leadId = body.leadId?.trim();
    if (!leadId) {
      return noStore(NextResponse.json({ error: "Pick a business to attach this to." }, { status: 400 }));
    }

    const existing = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, phone: true, altPhones: true },
    });
    if (!existing) {
      return noStore(NextResponse.json({ error: "That business is no longer on file." }, { status: 404 }));
    }

    const known = existing.phone === phone.e164 || existing.altPhones.includes(phone.e164);

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: known
        ? {}
        : existing.phone
          // The business already has a main number, so this one is another way
          // in rather than a correction.
          ? { altPhones: { push: phone.e164 } }
          : { phone: phone.e164 },
      select: LEAD_FIELDS,
    });

    return noStore(NextResponse.json({ lead, created: false, alreadyKnown: known }));
  }

  return noStore(NextResponse.json({ error: "Unknown request." }, { status: 400 }));
}
