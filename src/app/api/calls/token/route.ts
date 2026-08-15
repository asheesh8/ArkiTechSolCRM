import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { createVoiceAccessToken, twilioVoiceConfigured } from "@/lib/twilio-voice";

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return noStore(NextResponse.json({ error: "Please sign in before dialling." }, { status: 401 }));
  }

  // A voice token spends real money on a real phone line, so it is gated by the
  // same list that opens the cold-call room rather than by being logged in.
  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) {
    return noStore(NextResponse.json({ error: "You don't have access to the cold-call room." }, { status: 403 }));
  }

  if (!twilioVoiceConfigured()) {
    return noStore(
      NextResponse.json({ error: "Browser dialling isn't configured yet." }, { status: 503 }),
    );
  }

  const { token, identity, callerId, expiresInSeconds } = createVoiceAccessToken(user.id);
  return noStore(NextResponse.json({ token, identity, callerId, expiresInSeconds }));
}
