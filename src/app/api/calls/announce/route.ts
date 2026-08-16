import { NextResponse } from "next/server";
import {
  buildAnnouncementTwiml,
  twilioVoiceConfigured,
  validTwilioSignature,
  announcementWebhookUrl,
} from "@/lib/twilio-voice";

// Twilio requests this the moment the prospect picks up, and plays the result
// to them alone before bridging the call. It is the recording notice.

export async function POST(request: Request) {
  if (!twilioVoiceConfigured()) {
    return NextResponse.json({ error: "Browser dialling isn't configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  if (
    !validTwilioSignature({
      signature: request.headers.get("x-twilio-signature"),
      url: announcementWebhookUrl(),
      params,
    })
  ) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  return new NextResponse(buildAnnouncementTwiml(), {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
