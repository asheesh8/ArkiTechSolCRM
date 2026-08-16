import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { prisma } from "@/lib/prisma";
import { twilioConnectSchema } from "@/lib/schemas";
import { decryptSecret, encryptSecret, secretBoxReady } from "@/lib/secret-box";
import { twilioConnectionForUser } from "@/lib/twilio-credentials";
import {
  listNumbers,
  provisionVoiceAccess,
  releaseVoiceAccess,
  TwilioProvisionError,
  verifyCredentials,
} from "@/lib/twilio-provision";

// One teammate's own Twilio account.
//
// Nothing on this route ever sends a credential back to the browser. The GET
// describes the connection — which account, which number, when — and that is
// all a screen needs to render.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

async function requireCaller() {
  const user = await getCurrentUser();
  if (!user) return { error: noStore(NextResponse.json({ error: "Please sign in first." }, { status: 401 })) };

  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) {
    return {
      error: noStore(NextResponse.json({ error: "You don't have access to the cold-call room." }, { status: 403 })),
    };
  }

  return { user };
}

async function connectionFor(userId: string) {
  return {
    ...(await twilioConnectionForUser(userId)),
    canStore: secretBoxReady(),
  };
}

export async function GET() {
  const caller = await requireCaller();
  if (caller.error) return caller.error;

  return noStore(NextResponse.json(await connectionFor(caller.user.id)));
}

export async function POST(request: Request) {
  const caller = await requireCaller();
  if (caller.error) return caller.error;

  // Without a key there is nowhere safe to put an auth token, and storing one
  // in the clear is not an acceptable fallback.
  if (!secretBoxReady()) {
    return noStore(
      NextResponse.json(
        { error: "This deployment can't store credentials yet: CREDENTIAL_ENCRYPTION_KEY is not set." },
        { status: 503 },
      ),
    );
  }

  const parsed = twilioConnectSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return noStore(
      NextResponse.json({ error: issue?.message ?? "Check those details.", field: issue?.path[0] }, { status: 400 }),
    );
  }

  const { accountSid, authToken, callerId } = parsed.data;

  try {
    const account = await verifyCredentials(accountSid, authToken);

    // Caller ID is checked against the account rather than trusted from the
    // form: Twilio would reject the dial later anyway, and failing here says
    // why while the person is still looking at the field.
    const numbers = await listNumbers(accountSid, authToken);
    const chosen = numbers.find((number) => number.phoneNumber === callerId);

    if (!chosen) {
      return noStore(
        NextResponse.json(
          { error: "That number isn't on this Twilio account.", field: "callerId" },
          { status: 400 },
        ),
      );
    }
    if (!chosen.voiceCapable) {
      return noStore(
        NextResponse.json(
          { error: "That number can't make voice calls. Pick one with voice enabled.", field: "callerId" },
          { status: 400 },
        ),
      );
    }

    const provisioned = await provisionVoiceAccess(accountSid, authToken, callerId);

    // Reconnecting replaces the old row, so the key and app it provisioned are
    // now orphaned on the user's account. Clean them up rather than leaving a
    // new pair behind on every reconnect.
    let previous: {
      accountSid: string;
      apiKeySid: string;
      twimlAppSid: string;
      authTokenCipher: string;
    } | null = null;

    try {
      previous = await prisma.twilioAccount.findUnique({
        where: { userId: caller.user.id },
        select: { accountSid: true, apiKeySid: true, twimlAppSid: true, authTokenCipher: true },
      });

      const authTokenCipher = encryptSecret(authToken);
      const apiKeySecretCipher = encryptSecret(provisioned.apiKeySecret);

      await prisma.twilioAccount.upsert({
        where: { userId: caller.user.id },
        create: {
          userId: caller.user.id,
          accountSid,
          apiKeySid: provisioned.apiKeySid,
          twimlAppSid: provisioned.twimlAppSid,
          callerId,
          friendlyName: account.friendlyName,
          authTokenCipher,
          apiKeySecretCipher,
        },
        update: {
          accountSid,
          apiKeySid: provisioned.apiKeySid,
          twimlAppSid: provisioned.twimlAppSid,
          callerId,
          friendlyName: account.friendlyName,
          authTokenCipher,
          apiKeySecretCipher,
        },
      });
    } catch (saveError) {
      // Provisioning has already created billable-account resources at this
      // point. If encryption or the database write fails, revoke those new
      // resources so a retry does not litter the teammate's Twilio account.
      await releaseVoiceAccess(
        accountSid,
        authToken,
        provisioned.apiKeySid,
        provisioned.twimlAppSid,
      ).catch(() => {});
      throw saveError;
    }

    if (previous) {
      // If the teammate is reconnecting the same account after rotating its
      // Auth Token, the newly verified token is the one that can revoke the old
      // resources. For a different account, only the stored token can do it.
      const previousToken = previous.accountSid === accountSid
        ? authToken
        : decryptSecret(previous.authTokenCipher);
      if (previousToken) {
        await releaseVoiceAccess(
          previous.accountSid,
          previousToken,
          previous.apiKeySid,
          previous.twimlAppSid,
        ).catch(() => {});
      }
    }

    return noStore(NextResponse.json(await connectionFor(caller.user.id)));
  } catch (error) {
    if (error instanceof TwilioProvisionError) {
      return noStore(NextResponse.json({ error: error.message, field: error.field }, { status: 400 }));
    }
    console.error("[Twilio connect] Couldn't connect the account:", error);
    return noStore(NextResponse.json({ error: "Couldn't connect that Twilio account." }, { status: 502 }));
  }
}

export async function DELETE() {
  const caller = await requireCaller();
  if (caller.error) return caller.error;

  const existing = await prisma.twilioAccount.findUnique({
    where: { userId: caller.user.id },
    select: { accountSid: true, apiKeySid: true, twimlAppSid: true, authTokenCipher: true },
  });

  if (!existing) {
    return noStore(NextResponse.json(await connectionFor(caller.user.id)));
  }

  // The row goes first. Revoking on Twilio's side is a courtesy that must not
  // be able to strand a credential in this database if it fails.
  await prisma.twilioAccount.delete({ where: { userId: caller.user.id } });

  const authToken = decryptSecret(existing.authTokenCipher);
  if (authToken) {
    await releaseVoiceAccess(existing.accountSid, authToken, existing.apiKeySid, existing.twimlAppSid).catch(() => {});
  }

  return noStore(NextResponse.json(await connectionFor(caller.user.id)));
}
