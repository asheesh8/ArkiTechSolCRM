import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COLD_CALL_SOURCE } from "@/lib/call-recording";
import type { CallDraft } from "@/lib/call-summary";

// The cold-call room polls this after hanging up, to fill in the wrap-up card.
// Processing a recording takes tens of seconds, so the answer is usually
// "still working" for a while before the draft appears.

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return noStore(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));

  const select = {
    status: true,
    source: true,
    userId: true,
    title: true,
    summary: true,
    analysis: true,
    processingError: true,
    durationSecs: true,
  } as const;

  // The browser SDK documents call parameters for incoming calls, so an
  // outgoing leg can finish without ever exposing its SID. Rather than lose the
  // write-up when that happens, the room can ask for its own last call instead
  // — one person dials one call at a time, so "most recent, within the hour" is
  // the same call it just hung up on.
  const callSid = request.nextUrl.searchParams.get("callSid")?.trim();
  const conversation = callSid
    ? await prisma.receptionistConversation.findUnique({
        where: { providerConversationId: callSid },
        select,
      })
    : await prisma.receptionistConversation.findFirst({
        where: {
          source: COLD_CALL_SOURCE,
          userId: user.id,
          startedAt: { gte: new Date(Date.now() - 60 * 60 * 1_000) },
        },
        orderBy: { startedAt: "desc" },
        select,
      });

  if (!conversation || conversation.source !== COLD_CALL_SOURCE) {
    return noStore(NextResponse.json({ error: "No such call." }, { status: 404 }));
  }

  // A rep can read back their own calls; anything wider is a manager's view.
  if (!isManager(user) && conversation.userId !== user.id) {
    return noStore(NextResponse.json({ error: "That call isn't yours." }, { status: 403 }));
  }

  const ready = conversation.status === "done";
  const draft = ready && conversation.analysis ? (conversation.analysis as unknown as CallDraft) : null;

  return noStore(
    NextResponse.json({
      status: conversation.status,
      ready,
      draft,
      title: conversation.title,
      summary: conversation.summary,
      durationSecs: conversation.durationSecs,
      error: conversation.processingError,
    }),
  );
}
