import { NextResponse } from "next/server";
import twilio from "twilio";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { prisma } from "@/lib/prisma";
import { voiceConfigForUser } from "@/lib/twilio-credentials";

// Messages left on the rep's own number.
//
// Twilio stores a recording for every `<Record>` verb, whoever wrote the TwiML
// — a bin, a Studio flow, this app. So voicemail works here without this app
// owning the greeting, which is the point: the caller-facing decision stays in
// the Twilio console where its owner can change it without a deploy.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

const PAGE_SIZE = 15;

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
    return noStore(NextResponse.json({ voicemails: [], configured: false }));
  }

  try {
    const client = twilio(config.accountSid, config.authToken, { lazyLoading: true });
    const recordings = await client.recordings.list({ limit: PAGE_SIZE });

    // A recording alone doesn't say who left it, so each is resolved back to
    // its call. Outbound recordings exist too when TWILIO_RECORD_CALLS is on —
    // those are cold calls this rep made, not messages anyone left them.
    const withCalls = await Promise.all(
      recordings.map(async (recording) => {
        try {
          const call = await client.calls(recording.callSid).fetch();
          return { recording, call };
        } catch {
          return { recording, call: null };
        }
      }),
    );

    const inbound = withCalls.filter(({ call }) => call?.direction?.startsWith("inbound"));

    const numbers = [...new Set(inbound.map(({ call }) => call?.from).filter((n): n is string => Boolean(n)))];
    const leads = numbers.length
      ? await prisma.lead.findMany({
          where: { OR: [{ phone: { in: numbers } }, { altPhones: { hasSome: numbers } }] },
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
        voicemails: inbound.map(({ recording, call }) => ({
          sid: recording.sid,
          from: call?.from ?? null,
          durationSecs: Number(recording.duration ?? 0),
          at: recording.dateCreated ? new Date(recording.dateCreated).toISOString() : null,
          lead: call?.from ? byNumber.get(call.from) ?? null : null,
        })),
      }),
    );
  } catch (error) {
    console.error("[Voicemail] Couldn't load:", error);
    return noStore(NextResponse.json({ error: "Couldn't load your voicemail." }, { status: 502 }));
  }
}
