import { after, NextResponse } from "next/server";
import { archiveColdCallRecording } from "@/lib/call-recording";
import { recordingWebhookUrl, twilioVoiceConfigured, validTwilioSignature } from "@/lib/twilio-voice";

// Twilio posts here once a recording has finished processing.
//
// Downloading, splitting, transcribing and summarising a five-minute call takes
// far longer than a webhook should hold a connection open, and a slow reply is
// read as a failure and retried — which would transcribe the same call twice.
// So the work happens in `after`, once Twilio already has its 200.

// Transcription runs inside this route's budget, so it needs a real one.
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!twilioVoiceConfigured()) {
    return NextResponse.json({ error: "Browser dialling isn't configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  if (
    !validTwilioSignature({
      signature: request.headers.get("x-twilio-signature"),
      url: recordingWebhookUrl(),
      params,
    })
  ) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  const callSid = params.CallSid;
  const recordingSid = params.RecordingSid;
  const recordingUrl = params.RecordingUrl;

  if (!callSid || !recordingSid || !recordingUrl) {
    return NextResponse.json({ error: "Incomplete recording callback." }, { status: 400 });
  }

  if (params.RecordingStatus && params.RecordingStatus !== "completed") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const durationSecs = Number(params.RecordingDuration ?? 0);

  after(async () => {
    await archiveColdCallRecording({
      callSid,
      recordingSid,
      recordingUrl,
      durationSecs: Number.isFinite(durationSecs) ? durationSecs : 0,
    });
  });

  return NextResponse.json({ received: true });
}
