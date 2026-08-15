import "server-only";

import twilio from "twilio";

// Browser dialing for the cold-call room. The browser never sees an account
// credential — it gets a short-lived access token, and every decision about
// *what* it is allowed to dial is made here, on the server, when Twilio calls
// back for TwiML.

export class TwilioVoiceConfigurationError extends Error {
  constructor(message = "Browser dialing is not configured.") {
    super(message);
    this.name = "TwilioVoiceConfigurationError";
  }
}

type TwilioVoiceConfig = {
  accountSid: string;
  apiKeySid: string;
  apiKeySecret: string;
  authToken: string;
  twimlAppSid: string;
  callerId: string;
};

// Longer than any sales call, short enough that a token lifted from a browser
// stops working the same morning. The device refreshes itself before expiry.
const TOKEN_TTL_SECONDS = 60 * 60;

// A prospect who hasn't picked up in 30 seconds isn't going to.
const DIAL_TIMEOUT_SECONDS = 30;

function readConfig(): TwilioVoiceConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const apiKeySid = process.env.TWILIO_API_KEY_SID?.trim();
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twimlAppSid = process.env.TWILIO_TWIML_APP_SID?.trim();
  const callerId = process.env.TWILIO_CALLER_ID?.trim();

  if (!accountSid || !apiKeySid || !apiKeySecret || !authToken || !twimlAppSid || !callerId) {
    return null;
  }

  return { accountSid, apiKeySid, apiKeySecret, authToken, twimlAppSid, callerId };
}

function requireConfig() {
  const config = readConfig();
  if (!config) throw new TwilioVoiceConfigurationError();
  return config;
}

/**
 * Whether the dialer can run at all. Screens call this so a missing key shows a
 * quiet "not set up yet" note instead of a broken Call button.
 */
export function twilioVoiceConfigured() {
  return readConfig() !== null;
}

/** The number a prospect sees. Not a secret — it's the business line. */
export function twilioCallerId() {
  return readConfig()?.callerId ?? null;
}

/**
 * The exact URL Twilio will request for TwiML. Signature validation hashes the
 * URL, so this has to match what Twilio dialled byte for byte — behind a proxy
 * the inbound request's own host header is rewritten and cannot be trusted.
 */
export function voiceWebhookUrl() {
  const explicit = process.env.TWILIO_VOICE_WEBHOOK_URL?.trim();
  if (explicit) return explicit;

  const base = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) return null;

  return `${base.replace(/\/+$/, "")}/api/calls/voice`;
}

/**
 * Mint a voice token for one teammate. Identity is the CRM user id, so Twilio's
 * own call logs line up with whoever was signed in.
 */
export function createVoiceAccessToken(identity: string) {
  const config = requireConfig();

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
 * Deliberately does not record. Recording is worth having, but it has to arrive
 * with a spoken notice and stored proof that the notice played — several states
 * ArkiTech calls into require every party to consent, and Massachusetts treats
 * a silent recording as a crime rather than a civil matter. Adding `record`
 * here without that announcement would be the whole problem in one attribute.
 */
export function buildDialTwiml(to: string) {
  const config = requireConfig();
  const response = new twilio.twiml.VoiceResponse();

  const dial = response.dial({
    callerId: config.callerId,
    // Without this the leg counts as answered the moment Twilio picks it up, so
    // the rep hears generated ringback and every no-answer is logged as a
    // connected call of about thirty seconds.
    answerOnBridge: true,
    timeout: DIAL_TIMEOUT_SECONDS,
  });
  dial.number(to);

  return response.toString();
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
 */
export function validTwilioSignature({
  signature,
  url,
  params,
}: {
  signature: string | null;
  url: string | null;
  params: Record<string, string>;
}) {
  const config = readConfig();
  if (!config || !signature || !url) return false;

  return twilio.validateRequest(config.authToken, signature, url, params);
}
