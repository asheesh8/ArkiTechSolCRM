import "server-only";

import twilio from "twilio";
import type { TwilioVoiceConfig } from "@/lib/twilio-credentials";

// Browser dialing for the cold-call room. The browser never sees an account
// credential — it gets a short-lived access token, and every decision about
// *what* it is allowed to dial is made here, on the server, when Twilio calls
// back for TwiML.
//
// Nothing here reads credentials. Each teammate may be dialling on their own
// Twilio account, so the config arrives as an argument and `twilio-credentials`
// is the only module that decides whose it is.

export class TwilioVoiceConfigurationError extends Error {
  constructor(message = "Browser dialing is not configured.") {
    super(message);
    this.name = "TwilioVoiceConfigurationError";
  }
}

export type { TwilioVoiceConfig };

// Longer than any sales call, short enough that a token lifted from a browser
// stops working the same morning. The device refreshes itself before expiry.
const TOKEN_TTL_SECONDS = 60 * 60;

// A prospect who hasn't picked up in 30 seconds isn't going to.
const DIAL_TIMEOUT_SECONDS = 30;

/**
 * Public origin Twilio reaches this app on. Signature validation hashes the
 * full URL, so it has to match what Twilio requested byte for byte — behind a
 * proxy the inbound request's own host header is rewritten and can't be used.
 */
function publicOrigin() {
  const explicit = process.env.TWILIO_VOICE_WEBHOOK_URL?.trim();
  if (explicit) return explicit.replace(/\/api\/calls\/voice\/?$/, "").replace(/\/+$/, "");

  const base = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return base ? base.replace(/\/+$/, "") : null;
}

/** The URL Twilio requests for dial instructions. */
export function voiceWebhookUrl() {
  const origin = publicOrigin();
  return origin ? `${origin}/api/calls/voice` : null;
}

/** Played to the person who answers, before the call is bridged. */
export function announcementWebhookUrl() {
  const origin = publicOrigin();
  return origin ? `${origin}/api/calls/announce` : null;
}

/** Where Twilio posts once a recording has finished processing. */
export function recordingWebhookUrl() {
  const origin = publicOrigin();
  return origin ? `${origin}/api/calls/recording` : null;
}

// Recording is opt-in on purpose. Turning it on is a decision with legal weight
// in half the states ArkiTech calls into, so it takes a deliberate env var
// rather than arriving switched on with a deploy.
//
// It stays deployment-wide rather than per-account for the same reason: whether
// this company records its calls is not a checkbox to hand each new rep.
export function recordingEnabled() {
  const flag = process.env.TWILIO_RECORD_CALLS?.trim().toLowerCase();
  return flag === "true" || flag === "1";
}

export const CONSENT_ANNOUNCEMENT =
  process.env.TWILIO_CONSENT_ANNOUNCEMENT?.trim() ||
  "Just so you know, this call is recorded for quality and training. Connecting you now.";

/**
 * What the answering party hears before being bridged.
 *
 * This is the consent notice, and it is why recording is safe to enable at all:
 * several states ArkiTech calls into require every party to agree, and in
 * Massachusetts a silent recording is a criminal matter rather than a civil
 * one. Playing it after the leg is answered also puts the notice inside the
 * recording itself, which is the proof worth having.
 */
export function buildAnnouncementTwiml() {
  const response = new twilio.twiml.VoiceResponse();
  response.say({ voice: "Polly.Joanna" }, CONSENT_ANNOUNCEMENT);
  return response.toString();
}

/**
 * Mint a voice token for one teammate. Identity is the CRM user id, so Twilio's
 * own call logs line up with whoever was signed in — and so the voice webhook
 * can tell whose account to dial the leg on.
 */
export function createVoiceAccessToken(identity: string, config: TwilioVoiceConfig) {
  const token = new twilio.jwt.AccessToken(config.accountSid, config.apiKeySid, config.apiKeySecret, {
    identity,
    ttl: TOKEN_TTL_SECONDS,
  });

  token.addGrant(
    new twilio.jwt.AccessToken.VoiceGrant({
      outgoingApplicationSid: config.twimlAppSid,
      // Outbound only. Ringing the browser for inbound calls is a separate
      // decision about who is on shift, not something to enable by accident.
      incomingAllow: false,
    }),
  );

  return {
    token: token.toJwt(),
    identity,
    callerId: config.callerId,
    expiresInSeconds: TOKEN_TTL_SECONDS,
  };
}

/**
 * TwiML for one outbound leg.
 *
 * Recording only ever turns on together with the spoken notice: the announce
 * URL is what the prospect hears when they pick up, and it is a hard
 * precondition here rather than a separate setting someone could forget. If the
 * app has no public URL to serve that notice from, the call still goes through
 * — unrecorded.
 */
export function buildDialTwiml(to: string, config: TwilioVoiceConfig) {
  const response = new twilio.twiml.VoiceResponse();

  const announceUrl = announcementWebhookUrl();
  const recordingUrl = recordingWebhookUrl();
  const record = recordingEnabled() && Boolean(announceUrl);

  const dial = response.dial({
    callerId: config.callerId,
    // Without this the leg counts as answered the moment Twilio picks it up, so
    // the rep hears generated ringback and every no-answer is logged as a
    // connected call of about thirty seconds.
    answerOnBridge: true,
    timeout: DIAL_TIMEOUT_SECONDS,
    ...(record
      ? {
          // Dual channel is the whole trick: each leg lands on its own channel,
          // so the transcript knows who spoke without a diarization model.
          record: "record-from-answer-dual" as const,
          recordingStatusCallback: recordingUrl ?? undefined,
          recordingStatusCallbackEvent: ["completed"],
        }
      : {}),
  });

  // The `url` on <Number> plays to the answering party only, then bridges.
  dial.number(announceUrl ? { url: announceUrl } : {}, to);

  return response.toString();
}

/**
 * Download a finished recording. Twilio serves these behind account auth, so
 * the media never becomes a public URL that leaks a client conversation.
 */
export async function fetchTwilioRecording(recordingUrl: string, config: TwilioVoiceConfig) {
  const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

  // Twilio picks the format from the extension; `.wav` is uncompressed PCM,
  // which is what the channel splitter reads.
  const url = recordingUrl.endsWith(".wav") ? recordingUrl : `${recordingUrl}.wav`;

  const response = await fetch(url, { headers: { Authorization: `Basic ${credentials}` } });
  if (!response.ok) {
    throw new Error(`Couldn't download the recording (${response.status}).`);
  }

  return Buffer.from(await response.arrayBuffer());
}

/** TwiML that tells the rep why nothing is ringing, instead of dying silently. */
export function buildSpokenErrorTwiml(message: string) {
  const response = new twilio.twiml.VoiceResponse();
  response.say({ voice: "Polly.Joanna" }, message);
  response.hangup();
  return response.toString();
}

/**
 * Verify a request really came from Twilio. Without this the TwiML endpoint is
 * an open relay: anyone who can POST to it could place calls billed to the
 * account, with the business number as caller ID.
 *
 * The auth token belongs to the account named in the request body, which is
 * unverified until this passes — that is the point. A forged body can claim any
 * account SID it likes, but it cannot produce a signature for one.
 */
export function validTwilioSignature({
  signature,
  url,
  params,
  authToken,
}: {
  signature: string | null;
  url: string | null;
  params: Record<string, string>;
  authToken: string | null;
}) {
  if (!authToken || !signature || !url) return false;

  return twilio.validateRequest(authToken, signature, url, params);
}
