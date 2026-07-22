import { NextResponse } from "next/server";
import { getCurrentUser, isManager } from "@/lib/auth";
import {
  ElevenLabsConfigurationError,
  ElevenLabsUpstreamError,
  getElevenLabsAudio,
} from "@/lib/elevenlabs";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

function errorJson(error: string, status: number) {
  const response = NextResponse.json({ error }, { status });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return errorJson("Unauthorized", 401);
  if (!isManager(user)) return errorJson("Manager access is required.", 403);

  const { id } = await context.params;
  const conversation = await prisma.receptionistConversation.findUnique({
    where: { id },
    select: { providerConversationId: true, hasAudio: true },
  });
  if (!conversation) return errorJson("Conversation not found.", 404);
  if (!conversation.hasAudio) return errorJson("This conversation has no recording.", 404);

  try {
    const upstream = await getElevenLabsAudio(
      conversation.providerConversationId,
      request.headers.get("range"),
    );
    const headers = new Headers({
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
    });
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    if (error instanceof ElevenLabsConfigurationError) {
      return errorJson("The receptionist recording connection is not configured.", 503);
    }
    if (error instanceof ElevenLabsUpstreamError) {
      return errorJson("The recording is temporarily unavailable.", error.status === 404 ? 404 : 502);
    }
    console.error("[Receptionist audio] Playback failed:", error instanceof Error ? error.message : "unknown error");
    return errorJson("The recording could not be loaded.", 500);
  }
}
