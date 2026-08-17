import { NextResponse } from "next/server";
import twilio from "twilio";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { blooioConfigured, listBlooioMessages } from "@/lib/blooio";
import { checkPhone } from "@/lib/phone";
import { messagingConfigForUser } from "@/lib/twilio-credentials";

// One SMS conversation, both directions.
//
// Worth knowing: replies land here without this app having any inbound webhook
// configured. Twilio logs every message the number receives whether or not
// anyone is listening, so a thread can be read back even though nothing is
// currently notified when a prospect answers. That is enough to work a funnel
// by hand; it is not enough to be told when someone replies.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return noStore(NextResponse.json({ error: "Please sign in first." }, { status: 401 }));
  }

  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) {
    return noStore(NextResponse.json({ error: "You don't have access to the outreach room." }, { status: 403 }));
  }

  const other = checkPhone(new URL(request.url).searchParams.get("with"));
  if (!other.e164) {
    return noStore(NextResponse.json({ error: "Which number's thread?" }, { status: 400 }));
  }

  // Read the thread from whichever provider sent it. Blooio holds the
  // iMessage and RCS history that Twilio never sees.
  if (blooioConfigured()) {
    try {
      const messages = await listBlooioMessages(other.e164);
      return noStore(NextResponse.json({ configured: true, via: "blooio", messages }));
    } catch (error) {
      console.error("[Message thread] Blooio read failed, falling back to Twilio:", error);
    }
  }

  const config = await messagingConfigForUser(user.id);
  if (!config) {
    return noStore(NextResponse.json({ messages: [], configured: false }));
  }

  try {
    const client = twilio(config.accountSid, config.authToken, { lazyLoading: true });

    // Twilio filters on one direction at a time, so a conversation is two
    // queries stitched back together in time order.
    const [outbound, inbound] = await Promise.all([
      client.messages.list({ to: other.e164, from: config.from, limit: PAGE_SIZE }),
      client.messages.list({ to: config.from, from: other.e164, limit: PAGE_SIZE }),
    ]);

    const messages = [...outbound, ...inbound]
      .map((message) => ({
        sid: message.sid,
        body: message.body ?? "",
        outbound: message.from === config.from,
        status: message.status,
        // `dateSent` is null until Twilio hands the message off, so a just-queued
        // message falls back to when it was created rather than sorting to 1970.
        at: (message.dateSent ?? message.dateCreated)?.toISOString() ?? null,
        errorMessage: message.errorMessage ?? null,
      }))
      .sort((a, b) => (a.at ?? "").localeCompare(b.at ?? ""));

    return noStore(NextResponse.json({ configured: true, from: config.from, messages }));
  } catch (error) {
    console.error("[Message thread] Couldn't load:", error);
    return noStore(NextResponse.json({ error: "Couldn't load that conversation." }, { status: 502 }));
  }
}
