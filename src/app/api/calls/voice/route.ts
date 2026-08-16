import { after, NextResponse } from "next/server";
import { recordColdCallAttempt } from "@/lib/call-recording";
import { checkPhone } from "@/lib/phone";
import {
  buildDialTwiml,
  buildSpokenErrorTwiml,
  twilioCallerId,
  twilioVoiceConfigured,
  validTwilioSignature,
  voiceWebhookUrl,
} from "@/lib/twilio-voice";

// Twilio requests this when the browser softphone starts a call, and expects
// TwiML back describing what to do with the leg.

function twiml(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

/** Calls from the JS SDK arrive as `client:<identity>`, and identity is a user id. */
function userIdFrom(from: string | undefined) {
  if (!from?.startsWith("client:")) return null;
  return from.slice("client:".length).trim() || null;
}

export async function POST(request: Request) {
  if (!twilioVoiceConfigured()) {
    return NextResponse.json({ error: "Browser dialling isn't configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  if (
    !validTwilioSignature({
      signature: request.headers.get("x-twilio-signature"),
      url: voiceWebhookUrl(),
      params,
    })
  ) {
    // Anyone who can reach this URL could otherwise place calls billed to the
    // account, showing the business number as caller ID.
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  // Never dial the raw string the browser sent. The same validation the outreach
  // screen uses decides what counts as a US number worth ringing.
  const phone = checkPhone(params.To ?? "");
  if (!phone.textable || !phone.e164) {
    return twiml(
      buildSpokenErrorTwiml(
        "That number doesn't look like a valid US phone number. Please check it in the C R M and try again.",
      ),
    );
  }

  // Logged after the response so nothing about writing a row can delay a call
  // connecting. A dial that rings out still leaves this record behind.
  const callSid = params.CallSid;
  if (callSid) {
    const userId = userIdFrom(params.From);
    const leadId = params.LeadId?.trim() || null;
    after(async () => {
      await recordColdCallAttempt({
        callSid,
        userId,
        leadId,
        toPhone: phone.e164,
        fromPhone: twilioCallerId(),
      }).catch((error) => {
        console.error("[Cold call] Couldn't record the attempt:", error);
      });
    });
  }

  return twiml(buildDialTwiml(phone.e164));
}
