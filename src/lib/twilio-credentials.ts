import "server-only";

import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/secret-box";

// Where a set of Twilio credentials comes from.
//
// Two teammates dialling the same afternoon can be on entirely different Twilio
// accounts, so nothing about a call may be read from module scope. Every entry
// point resolves a config first, and the callers below are the only ways to get
// one.

export type TwilioVoiceConfig = {
  accountSid: string;
  apiKeySid: string;
  apiKeySecret: string;
  authToken: string;
  twimlAppSid: string;
  callerId: string;
};

export type TwilioConfigSource = "user" | "environment";

export type ResolvedTwilioConfig = TwilioVoiceConfig & { source: TwilioConfigSource };

/**
 * The shared company line, from the environment.
 *
 * Kept as a fallback so an install that already had the env vars set keeps
 * dialling with no migration, and so a team that wants one number for everyone
 * never has to connect anything in the UI.
 */
export function environmentConfig(): TwilioVoiceConfig | null {
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

type StoredAccount = {
  accountSid: string;
  apiKeySid: string;
  twimlAppSid: string;
  callerId: string;
  authTokenCipher: string;
  apiKeySecretCipher: string;
};

/**
 * A stored row is only usable if both secrets still decrypt. If the encryption
 * key was rotated they won't, and the honest answer is that this account is no
 * longer connected — which sends the rep back through the connect form instead
 * of failing on the Call button.
 */
function openStoredAccount(account: StoredAccount): TwilioVoiceConfig | null {
  const authToken = decryptSecret(account.authTokenCipher);
  const apiKeySecret = decryptSecret(account.apiKeySecretCipher);
  if (!authToken || !apiKeySecret) return null;

  return {
    accountSid: account.accountSid,
    apiKeySid: account.apiKeySid,
    apiKeySecret,
    authToken,
    twimlAppSid: account.twimlAppSid,
    callerId: account.callerId,
  };
}

const STORED_FIELDS = {
  accountSid: true,
  apiKeySid: true,
  twimlAppSid: true,
  callerId: true,
  authTokenCipher: true,
  apiKeySecretCipher: true,
} as const;

/**
 * The credentials one teammate dials on. Their own account wins; the shared
 * company line is what they get until they connect one.
 */
export async function voiceConfigForUser(userId: string): Promise<ResolvedTwilioConfig | null> {
  const account = await prisma.twilioAccount.findUnique({
    where: { userId },
    select: STORED_FIELDS,
  });

  if (account) {
    const config = openStoredAccount(account);
    if (config) return { ...config, source: "user" };
  }

  const fallback = environmentConfig();
  return fallback ? { ...fallback, source: "environment" } : null;
}

/**
 * Credentials for a webhook, which knows only which Twilio account is calling.
 *
 * The account SID in a webhook body is unverified at this point — it is a
 * lookup key, not proof of anything. What makes it safe is the order: this
 * returns the auth token that *would* have signed a genuine request from that
 * account, and the signature check that follows is what decides whether the
 * request is real.
 */
export async function voiceConfigsForAccount(accountSid: string | undefined): Promise<TwilioVoiceConfig[]> {
  const sid = accountSid?.trim();
  if (!sid) return [];

  const configs: TwilioVoiceConfig[] = [];
  const fallback = environmentConfig();
  if (fallback && fallback.accountSid === sid) configs.push(fallback);

  // Two teammates may have connected the same Twilio account. Their encrypted
  // tokens normally match, but a token rotation can leave an older row stale.
  // Return every decryptable candidate so the webhook route can select the one
  // whose token actually validates the request signature.
  const accounts = await prisma.twilioAccount.findMany({
    where: { accountSid: sid },
    select: STORED_FIELDS,
    orderBy: { updatedAt: "desc" },
  });

  for (const account of accounts) {
    const config = openStoredAccount(account);
    if (config && !configs.some((candidate) => candidate.authToken === config.authToken)) {
      configs.push(config);
    }
  }

  return configs;
}

/** Just enough to send and read texts — no API key pair, no TwiML app. */
export type TwilioMessagingConfig = {
  accountSid: string;
  authToken: string;
  from: string;
  /** True when texting runs on a different account than calling. */
  separate: boolean;
};

/**
 * The account a teammate's texts go out on.
 *
 * Usually the same one they call from, but not always: US carriers filter
 * application-sent SMS until the sending number's A2P brand and campaign are
 * registered, and that clears days after voice already works. A rep in that gap
 * can point texting at a number that has cleared, and keep calling on their own.
 */
export async function messagingConfigForUser(userId: string): Promise<TwilioMessagingConfig | null> {
  const account = await prisma.twilioAccount.findUnique({
    where: { userId },
    select: { smsAccountSid: true, smsAuthTokenCipher: true, smsFrom: true },
  });

  if (account?.smsAccountSid && account.smsAuthTokenCipher && account.smsFrom) {
    const authToken = decryptSecret(account.smsAuthTokenCipher);
    if (authToken) {
      return { accountSid: account.smsAccountSid, authToken, from: account.smsFrom, separate: true };
    }
  }

  // No override, so texts ride on whatever calls ride on.
  const voice = await voiceConfigForUser(userId);
  return voice
    ? { accountSid: voice.accountSid, authToken: voice.authToken, from: voice.callerId, separate: false }
    : null;
}

/** What the cold-call room needs to describe the connection without exposing it. */
export async function twilioConnectionForUser(userId: string) {
  const account = await prisma.twilioAccount.findUnique({
    where: { userId },
    select: {
      accountSid: true,
      callerId: true,
      friendlyName: true,
      updatedAt: true,
      authTokenCipher: true,
      apiKeySecretCipher: true,
      apiKeySid: true,
      twimlAppSid: true,
    },
  });

  if (account) {
    const usable = openStoredAccount(account) !== null;
    return {
      connected: true as const,
      usable,
      accountSid: account.accountSid,
      callerId: account.callerId,
      friendlyName: account.friendlyName,
      connectedAt: account.updatedAt.toISOString(),
    };
  }

  const fallback = environmentConfig();
  return {
    connected: false as const,
    usable: fallback !== null,
    accountSid: null,
    callerId: fallback?.callerId ?? null,
    friendlyName: null,
    connectedAt: null,
  };
}
