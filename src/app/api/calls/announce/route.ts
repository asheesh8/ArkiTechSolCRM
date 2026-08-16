import { NextResponse } from "next/server";
import { voiceConfigsForAccount } from "@/lib/twilio-credentials";
import {
  buildAnnouncementTwiml,
  validTwilioSignature,
  announcementWebhookUrl,
} from "@/lib/twilio-voice";

// Twilio requests this the moment the prospect picks up, and plays the result
// to them alone before bridging the call. It is the recording notice.

export async function POST(request: Request) {
  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  // The answering leg carries no client identity, so the account SID in the
  // body is the only handle on whose auth token should have signed this.
  const candidates = await voiceConfigsForAccount(params.AccountSid);
  if (candidates.length === 0) {
    return NextResponse.json({ error: "Browser dialling isn't configured." }, { status: 503 });
  }

  const config = candidates.find((candidate) =>
    validTwilioSignature({
      signature: request.headers.get("x-twilio-signature"),
      url: announcementWebhookUrl(),
      params,
      authToken: candidate.authToken,
    }),
  );

  if (!config) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  return new NextResponse(buildAnnouncementTwiml(), {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
