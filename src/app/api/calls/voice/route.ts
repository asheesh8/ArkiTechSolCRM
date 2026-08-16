import { after, NextResponse } from "next/server";
import { recordColdCallAttempt } from "@/lib/call-recording";
import { checkPhone } from "@/lib/phone";
import { voiceConfigsForAccount, voiceConfigForUser } from "@/lib/twilio-credentials";
import {
  buildDialTwiml,
  buildSpokenErrorTwiml,
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
  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  // Whose credentials this leg belongs to, before anything is trusted.
  //
  // The token that started this call was minted on one teammate's account, so
  // that same account's auth token is what signed the request — resolving by
  // the caller identity gets the right one. Both this and the account SID
  // below are unverified hints at this point; the signature check is what
  // makes them true.
  const userId = userIdFrom(params.From);
  const userConfig = userId ? await voiceConfigForUser(userId) : null;
  const candidates = userId
    ? userConfig ? [userConfig] : []
    : await voiceConfigsForAccount(params.AccountSid);

  if (candidates.length === 0) {
    return NextResponse.json({ error: "Browser dialling isn't configured." }, { status: 503 });
  }

  const config = candidates.find((candidate) =>
    validTwilioSignature({
      signature: request.headers.get("x-twilio-signature"),
      url: voiceWebhookUrl(),
      params,
      authToken: candidate.authToken,
    }),
  );

  if (!config) {
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
    const leadId = params.LeadId?.trim() || null;
    after(async () => {
      await recordColdCallAttempt({
        callSid,
        userId,
        leadId,
        toPhone: phone.e164,
        fromPhone: config.callerId,
      }).catch((error) => {
        console.error("[Cold call] Couldn't record the attempt:", error);
      });
    });
  }

  return twiml(buildDialTwiml(phone.e164, config));
}
