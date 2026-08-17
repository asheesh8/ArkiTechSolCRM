import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { voiceConfigForUser } from "@/lib/twilio-credentials";

// Stream one voicemail.
//
// Twilio serves recording media behind account auth, and those credentials
// can't reach the browser — so the audio is proxied rather than linked. That
// also keeps a message someone left for this business off any URL that would
// still play after they were removed from the team.

export async function GET(_request: Request, { params }: { params: Promise<{ sid: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Sign in first.", { status: 401 });

  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) return new NextResponse("No access.", { status: 403 });

  const config = await voiceConfigForUser(user.id);
  if (!config) return new NextResponse("No Twilio number connected.", { status: 503 });

  const { sid } = await params;
  if (!/^RE[0-9a-f]{32}$/i.test(sid)) return new NextResponse("Not a recording.", { status: 400 });

  const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Recordings/${sid}.mp3`;

  const upstream = await fetch(url, { headers: { Authorization: `Basic ${credentials}` } });
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Couldn't fetch that recording.", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
