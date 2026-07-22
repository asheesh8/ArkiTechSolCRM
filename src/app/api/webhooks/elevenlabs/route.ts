import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  archiveReceptionistWebhookConversation,
  ElevenLabsConfigurationError,
  ElevenLabsWebhookPayloadError,
} from "@/lib/elevenlabs";

const SIGNATURE_TOLERANCE_SECONDS = 30 * 60;

function validWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;
  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v0="))
    .map((part) => part.slice(3));
  const timestampNumber = Number(timestamp);
  if (!timestamp || !Number.isFinite(timestampNumber) || signatures.length === 0) return false;
  if (Math.abs(Math.floor(Date.now() / 1_000) - timestampNumber) > SIGNATURE_TOLERANCE_SECONDS) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest();
  return signatures.some((signature) => {
    if (!/^[a-f\d]{64}$/i.test(signature)) return false;
    const received = Buffer.from(signature, "hex");
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook ingestion is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  if (!validWebhookSignature(rawBody, request.headers.get("elevenlabs-signature"), webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  if (typeof event !== "object" || event === null) {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  const { type, data } = event as { type?: unknown; data?: unknown };
  if (type !== "post_call_transcription") {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const result = await archiveReceptionistWebhookConversation(data);
    return NextResponse.json({ received: true, ignored: result.ignored });
  } catch (error) {
    if (error instanceof ElevenLabsConfigurationError) {
      return NextResponse.json({ error: "Webhook ingestion is not configured." }, { status: 503 });
    }
    if (error instanceof ElevenLabsWebhookPayloadError) {
      return NextResponse.json({ error: "Invalid conversation payload." }, { status: 400 });
    }
    console.error("[ElevenLabs webhook] Archive failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Conversation archival failed." }, { status: 500 });
  }
}
