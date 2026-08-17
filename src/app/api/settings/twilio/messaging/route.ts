import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { prisma } from "@/lib/prisma";
import { twilioConnectSchema } from "@/lib/schemas";
import { encryptSecret, secretBoxReady } from "@/lib/secret-box";
import { messagingConfigForUser } from "@/lib/twilio-credentials";
import { listNumbers, TwilioProvisionError, verifyCredentials } from "@/lib/twilio-provision";

// A second Twilio account used only for texting.
//
// Voice works the day a number is bought; texting does not. US carriers filter
// application-sent SMS until the sending number's A2P brand and campaign are
// registered, which takes days. This is the gap: point texting at a number that
// has already cleared, and keep calling on the one being reviewed.
//
// Nothing is provisioned here — sending needs only an account and a number, not
// the API key and TwiML app that browser dialling requires.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

async function requireCaller() {
  const user = await getCurrentUser();
  if (!user) return { error: noStore(NextResponse.json({ error: "Please sign in first." }, { status: 401 })) };

  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) {
    return { error: noStore(NextResponse.json({ error: "You don't have access to the outreach room." }, { status: 403 })) };
  }

  return { user };
}

export async function GET() {
  const caller = await requireCaller();
  if (caller.error) return caller.error;

  const config = await messagingConfigForUser(caller.user.id);
  return noStore(
    NextResponse.json({
      configured: Boolean(config),
      from: config?.from ?? null,
      separate: config?.separate ?? false,
      canStore: secretBoxReady(),
    }),
  );
}

export async function POST(request: Request) {
  const caller = await requireCaller();
  if (caller.error) return caller.error;

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
    await verifyCredentials(accountSid, authToken);

    const numbers = await listNumbers(accountSid, authToken);
    const chosen = numbers.find((number) => number.phoneNumber === callerId);
    if (!chosen) {
      return noStore(
        NextResponse.json({ error: "That number isn't on this Twilio account.", field: "callerId" }, { status: 400 }),
      );
    }

    // Texting from a number without the SMS capability fails on every send with
    // a code most people read as a bug in this app, so refuse it here instead.
    if (!chosen.smsCapable) {
      return noStore(
        NextResponse.json(
          { error: "That number can't send texts. Pick one with SMS enabled.", field: "callerId" },
          { status: 400 },
        ),
      );
    }

    // A texting sender hangs off the voice connection rather than standing
    // alone, so there has to be one to hang it off.
    const existing = await prisma.twilioAccount.findUnique({
      where: { userId: caller.user.id },
      select: { id: true },
    });
    if (!existing) {
      return noStore(
        NextResponse.json({ error: "Connect your calling number first." }, { status: 400 }),
      );
    }

    await prisma.twilioAccount.update({
      where: { userId: caller.user.id },
      data: {
        smsAccountSid: accountSid,
        smsAuthTokenCipher: encryptSecret(authToken),
        smsFrom: callerId,
      },
    });

    const config = await messagingConfigForUser(caller.user.id);
    return noStore(NextResponse.json({ configured: true, from: config?.from ?? null, separate: true }));
  } catch (error) {
    if (error instanceof TwilioProvisionError) {
      return noStore(NextResponse.json({ error: error.message, field: error.field }, { status: 400 }));
    }
    console.error("[Texting sender] Couldn't connect:", error);
    return noStore(NextResponse.json({ error: "Couldn't connect that texting number." }, { status: 502 }));
  }
}

export async function DELETE() {
  const caller = await requireCaller();
  if (caller.error) return caller.error;

  await prisma.twilioAccount.updateMany({
    where: { userId: caller.user.id },
    data: { smsAccountSid: null, smsAuthTokenCipher: null, smsFrom: null },
  });

  const config = await messagingConfigForUser(caller.user.id);
  return noStore(
    NextResponse.json({ configured: Boolean(config), from: config?.from ?? null, separate: false }),
  );
}
