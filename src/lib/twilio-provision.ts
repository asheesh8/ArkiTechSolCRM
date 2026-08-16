import "server-only";

import twilio from "twilio";
import { voiceWebhookUrl } from "@/lib/twilio-voice";

// Turning "I bought a number" into a working dialer.
//
// Browser dialing needs six values, but only two of them are things a person
// can reasonably be asked to find: the account SID and auth token printed on the
// Twilio console home page. The other four are an API key pair and a TwiML app,
// and creating those by hand means knowing to point the app's voice URL at this
// deployment — the step that silently breaks dialing when it is wrong. So this
// module makes them, and the rep never sees them.

export class TwilioProvisionError extends Error {
  readonly field: "accountSid" | "authToken" | "callerId" | "webhook" | null;

  constructor(message: string, field: TwilioProvisionError["field"] = null) {
    super(message);
    this.name = "TwilioProvisionError";
    this.field = field;
  }
}

// Named so a human scanning the Twilio console knows what made these and can
// revoke them without guessing.
const API_KEY_FRIENDLY_NAME = "ArkiTech CRM cold-call room";
const TWIML_APP_FRIENDLY_NAME = "ArkiTech CRM browser dialling";

type TwilioApiError = { status?: number; code?: number; message?: string };

function readTwilioError(error: unknown): TwilioApiError {
  return typeof error === "object" && error !== null ? (error as TwilioApiError) : {};
}

function client(accountSid: string, authToken: string) {
  return twilio(accountSid, authToken, { lazyLoading: true });
}

/**
 * Confirm the pair really opens the account before anything is created on it.
 *
 * Twilio answers a bad SID and a bad token with the same 20003, so the message
 * has to cover both rather than pointing at one field.
 */
export async function verifyCredentials(accountSid: string, authToken: string) {
  if (!/^AC[0-9a-f]{32}$/i.test(accountSid)) {
    throw new TwilioProvisionError(
      "That doesn't look like an Account SID. It starts with AC and is on your Twilio console home page.",
      "accountSid",
    );
  }

  try {
    const account = await client(accountSid, authToken).api.v2010.accounts(accountSid).fetch();

    if (account.status === "suspended" || account.status === "closed") {
      throw new TwilioProvisionError(
        `That Twilio account is ${account.status}. Twilio will need to reactivate it before it can place calls.`,
        "accountSid",
      );
    }

    return { friendlyName: account.friendlyName ?? null, status: account.status ?? null };
  } catch (error) {
    if (error instanceof TwilioProvisionError) throw error;

    const { status, code } = readTwilioError(error);
    if (status === 401 || code === 20003) {
      throw new TwilioProvisionError(
        "Twilio rejected those credentials. Check the Account SID and Auth Token on your console home page — the token is hidden behind a Show button.",
        "authToken",
      );
    }

    throw new TwilioProvisionError("Couldn't reach Twilio to check those credentials. Try again in a moment.");
  }
}

export type TwilioNumber = {
  phoneNumber: string;
  friendlyName: string;
  voiceCapable: boolean;
};

/**
 * The numbers this account owns, for picking caller ID.
 *
 * Only voice-capable numbers can be dialled out on, but the rest are returned
 * too and marked — "my number isn't listed" is a worse dead end than showing it
 * greyed out with a reason.
 */
export async function listNumbers(accountSid: string, authToken: string): Promise<TwilioNumber[]> {
  try {
    const numbers = await client(accountSid, authToken).incomingPhoneNumbers.list({ limit: 100 });

    return numbers.map((number) => ({
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName || number.phoneNumber,
      voiceCapable: Boolean(number.capabilities?.voice),
    }));
  } catch {
    throw new TwilioProvisionError("Couldn't list the numbers on that Twilio account.");
  }
}

/**
 * Create the API key and TwiML app this deployment dials through.
 *
 * Both are made fresh per connection rather than looked up and reused: a key
 * secret is readable exactly once, at creation, so there is no way to adopt an
 * existing key. The TwiML app is likewise per-connection, because its voice URL
 * has to match the origin this instance actually runs on.
 */
export async function provisionVoiceAccess(accountSid: string, authToken: string, callerId: string) {
  const webhook = voiceWebhookUrl();
  if (!webhook) {
    throw new TwilioProvisionError(
      "This deployment has no public URL for Twilio to call back on. Set NEXT_PUBLIC_APP_URL (or TWILIO_VOICE_WEBHOOK_URL) and try again.",
      "webhook",
    );
  }

  const api = client(accountSid, authToken);

  let apiKeySid: string;
  let apiKeySecret: string;
  try {
    const key = await api.newKeys.create({ friendlyName: API_KEY_FRIENDLY_NAME });
    apiKeySid = key.sid;
    // Twilio returns this once and never again. If it does not arrive there is
    // nothing to store and the connection has to fail rather than half-save.
    if (!key.secret) {
      throw new TwilioProvisionError("Twilio created an API key but didn't return its secret. Try connecting again.");
    }
    apiKeySecret = key.secret;
  } catch (error) {
    if (error instanceof TwilioProvisionError) throw error;
    throw new TwilioProvisionError("Couldn't create an API key on that Twilio account.");
  }

  try {
    const app = await api.applications.create({
      friendlyName: `${TWIML_APP_FRIENDLY_NAME} (${new URL(webhook).host})`,
      voiceUrl: webhook,
      voiceMethod: "POST",
    });

    return { apiKeySid, apiKeySecret, twimlAppSid: app.sid, callerId };
  } catch {
    // The key above is already live at this point. Leaving it behind would
    // litter the account with unusable credentials on every failed attempt.
    await api.keys(apiKeySid).remove().catch(() => {});
    throw new TwilioProvisionError("Couldn't create the TwiML app that browser dialling needs.");
  }
}

/**
 * Best-effort teardown when a teammate disconnects.
 *
 * Failures here are deliberately swallowed: the row is going away either way,
 * and a rep who wants their credentials out of this app should not be blocked
 * because Twilio is having a slow minute. Anything left behind is visible and
 * revocable in their own console.
 */
export async function releaseVoiceAccess(
  accountSid: string,
  authToken: string,
  apiKeySid: string,
  twimlAppSid: string,
) {
  const api = client(accountSid, authToken);
  await Promise.allSettled([
    api.keys(apiKeySid).remove(),
    api.applications(twimlAppSid).remove(),
  ]);
}
