import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { twilioCredentialsSchema } from "@/lib/schemas";
import { listNumbers, TwilioProvisionError, verifyCredentials } from "@/lib/twilio-provision";

// Step one of connecting an account: prove the credentials work and find out
// which numbers they can dial out on. Nothing is created or stored here, so a
// mistyped token costs the user nothing but a retry.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return noStore(NextResponse.json({ error: "Please sign in first." }, { status: 401 }));
  }

  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) {
    return noStore(NextResponse.json({ error: "You don't have access to the cold-call room." }, { status: 403 }));
  }

  const parsed = twilioCredentialsSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return noStore(NextResponse.json({ error: issue?.message ?? "Check those credentials.", field: issue?.path[0] }, { status: 400 }));
  }

  const { accountSid, authToken } = parsed.data;

  try {
    const account = await verifyCredentials(accountSid, authToken);
    const numbers = await listNumbers(accountSid, authToken);

    return noStore(
      NextResponse.json({
        friendlyName: account.friendlyName,
        numbers,
        // A trial account with no number yet is the common first-run state, and
        // it needs a different nudge than a wrong token.
        needsNumber: numbers.filter((number) => number.voiceCapable).length === 0,
      }),
    );
  } catch (error) {
    if (error instanceof TwilioProvisionError) {
      return noStore(NextResponse.json({ error: error.message, field: error.field }, { status: 400 }));
    }
    console.error("[Twilio connect] Verification failed:", error);
    return noStore(NextResponse.json({ error: "Couldn't check those credentials." }, { status: 502 }));
  }
}
