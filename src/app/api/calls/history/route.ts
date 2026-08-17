import { NextResponse } from "next/server";
import twilio from "twilio";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { prisma } from "@/lib/prisma";
import { voiceConfigForUser } from "@/lib/twilio-credentials";

// Recent calls, read straight from the rep's own Twilio account.
//
// Twilio is the source of truth here rather than the CRM: it has every leg,
// including the ones placed before this app existed and any dialled from a
// desk phone on the same number. What the CRM adds is names — a bare number
// tells a rep nothing, so each one is matched back to a lead where it can be.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

const PAGE_SIZE = 25;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return noStore(NextResponse.json({ error: "Please sign in first." }, { status: 401 }));
  }

  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) {
    return noStore(NextResponse.json({ error: "You don't have access to the outreach room." }, { status: 403 }));
  }

  const config = await voiceConfigForUser(user.id);
  if (!config) {
    return noStore(NextResponse.json({ calls: [], configured: false }));
  }

  try {
    const client = twilio(config.accountSid, config.authToken, { lazyLoading: true });
    // Roughly half of what comes back is dropped below, so ask for more than
    // one page's worth to fill a page.
    const calls = await client.calls.list({ limit: PAGE_SIZE * 2 });

    const rows = calls
      // Every browser call is logged twice: a parent leg from `client:<userId>`
      // with an empty `to`, and the child leg that actually dialled someone.
      // The parent is an artifact of how the softphone connects — it has no
      // counterparty and its duration is the leg to Twilio, not the
      // conversation — so only the child is a call anyone made.
      .filter((call) => !call.from?.startsWith("client:"))
      .map((call) => {
        const outbound = call.from === config.callerId;
        const counterparty = outbound ? call.to : call.from;
        return {
          sid: call.sid,
          counterparty,
          outbound,
          status: call.status,
          durationSecs: Number(call.duration ?? 0),
          startedAt: call.startTime ? new Date(call.startTime).toISOString() : null,
        };
      })
      .filter((row) => Boolean(row.counterparty?.trim()))
      .slice(0, PAGE_SIZE);

    // One query for every number on the page rather than one per row.
    const numbers = [...new Set(rows.map((row) => row.counterparty).filter((n): n is string => Boolean(n)))];
    const leads = numbers.length
      ? await prisma.lead.findMany({
          where: {
            OR: [{ phone: { in: numbers } }, { altPhones: { hasSome: numbers } }],
          },
          select: { id: true, businessName: true, phone: true, altPhones: true },
        })
      : [];

    const byNumber = new Map<string, { id: string; businessName: string }>();
    for (const lead of leads) {
      for (const number of [lead.phone, ...lead.altPhones]) {
        if (number) byNumber.set(number, { id: lead.id, businessName: lead.businessName });
      }
    }

    return noStore(
      NextResponse.json({
        configured: true,
        callerId: config.callerId,
        calls: rows.map((row) => ({ ...row, lead: row.counterparty ? byNumber.get(row.counterparty) ?? null : null })),
      }),
    );
  } catch (error) {
    console.error("[Call history] Couldn't load:", error);
    return noStore(NextResponse.json({ error: "Couldn't load your recent calls." }, { status: 502 }));
  }
}
