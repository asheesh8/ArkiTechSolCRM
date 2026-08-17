import { NextResponse } from "next/server";
import twilio from "twilio";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { blooioConfigured, sendBlooioMessage } from "@/lib/blooio";
import { checkPhone } from "@/lib/phone";
import { messagingConfigForUser } from "@/lib/twilio-credentials";

// Send one cold text from the rep's own Twilio number.
//
// The alternative this replaces was an `sms:` link, which handed the message to
// whatever Messages app the rep happened to have open — so the prospect saw a
// personal mobile number, replies went somewhere the CRM never saw, and nothing
// was logged. Sending through the connected number fixes the first two; the
// third still needs an inbound webhook, which does not exist yet.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

// Twilio bills per segment and a runaway template would be expensive as well as
// unreadable. Two segments is a generous ceiling for a cold opener.
const MAX_BODY_LENGTH = 320;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return noStore(NextResponse.json({ error: "Please sign in first." }, { status: 401 }));
  }

  // Sending spends money on a real line, so it is gated exactly like dialling.
  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) {
    return noStore(NextResponse.json({ error: "You don't have access to the outreach room." }, { status: 403 }));
  }

  const body = await request.json().catch(() => ({})) as { to?: string; body?: string };
  const message = body.body?.trim();
  const phone = checkPhone(body.to ?? "");

  if (!phone.textable || !phone.e164) {
    return noStore(NextResponse.json({ error: phone.reason || "That isn't a textable number." }, { status: 400 }));
  }
  if (!message) {
    return noStore(NextResponse.json({ error: "The message is empty." }, { status: 400 }));
  }
  if (message.length > MAX_BODY_LENGTH) {
    return noStore(
      NextResponse.json({ error: `Keep it under ${MAX_BODY_LENGTH} characters.` }, { status: 400 }),
    );
  }

  // Blooio first when it's configured: it reaches iMessage and RCS, and only
  // drops to SMS when the handset can't do better. Twilio is the fallback
  // rather than the alternative — a send that fails at Blooio is retried
  // rather than reported, because the rep cares that it arrived, not how.
  if (blooioConfigured()) {
    try {
      const sent = await sendBlooioMessage(phone.e164, message);
      return noStore(NextResponse.json({ sid: sent.id, status: sent.status, via: "blooio" }));
    } catch (error) {
      console.error("[Cold text] Blooio send failed, falling back to Twilio:", error);
    }
  }

  const config = await messagingConfigForUser(user.id);
  if (!config) {
    return noStore(
      NextResponse.json({ error: "Connect a Twilio number before texting." }, { status: 503 }),
    );
  }

  try {
    const client = twilio(config.accountSid, config.authToken, { lazyLoading: true });
    const sent = await client.messages.create({
      to: phone.e164,
      from: config.from,
      body: message,
    });

    return noStore(NextResponse.json({ sid: sent.sid, status: sent.status, via: "twilio" }));
  } catch (error) {
    const { code, message: twilioMessage } = (error ?? {}) as { code?: number; message?: string };

    // The errors a rep can actually act on, in their own terms. Everything else
    // falls through to Twilio's wording, which is usually specific enough.
    if (code === 21606 || code === 21212) {
      return noStore(
        NextResponse.json(
          { error: "Your connected number can't send texts. Pick an SMS-capable number in Twilio." },
          { status: 400 },
        ),
      );
    }
    if (code === 21610) {
      return noStore(
        NextResponse.json({ error: "This person replied STOP, so Twilio won't deliver to them." }, { status: 400 }),
      );
    }
    if (code === 21408 || code === 21211) {
      return noStore(NextResponse.json({ error: "Twilio rejected that number." }, { status: 400 }));
    }

    console.error("[Cold text] Couldn't send:", error);
    return noStore(
      NextResponse.json({ error: twilioMessage || "Couldn't send that text." }, { status: 502 }),
    );
  }
}
