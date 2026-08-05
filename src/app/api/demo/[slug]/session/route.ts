import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ElevenLabsConfigurationError,
  ElevenLabsUpstreamError,
  createElevenLabsSignedUrl,
} from "@/lib/elevenlabs";
import {
  OpenAIConfigurationError,
  OpenAIUpstreamError,
  createRealtimeClientSecret,
} from "@/lib/openai-realtime";
import { checkDemoRateLimit, clientIpFrom, hashIp } from "@/lib/voice-agents";

// Public. Hands a browser a short-lived credential to talk to one demo agent.
// Every guard that keeps this from becoming an open tap on paid voice minutes
// lives here: the per-agent demo toggle, then the rate limit, then the ledger
// row. No provider API key ever leaves the server.
//
// The response shape is discriminated by `provider` because the two providers
// connect completely differently — ElevenLabs hands back a signed WebSocket
// URL, OpenAI hands back an ephemeral key the browser uses for a WebRTC offer.
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const agent = await prisma.voiceAgent.findUnique({
    where: { slug },
    select: {
      id: true,
      providerAgentId: true,
      provider: true,
      instructions: true,
      voice: true,
      demoEnabled: true,
      isArchived: true,
    },
  });

  if (!agent || !agent.demoEnabled || agent.isArchived) {
    return NextResponse.json({ error: "This demo isn't available." }, { status: 404 });
  }

  const ipHash = hashIp(clientIpFrom(req.headers));
  const verdict = await checkDemoRateLimit(agent.id, ipHash);
  if (!verdict.allowed) {
    return NextResponse.json({ error: verdict.reason }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = agent.provider === "openai"
      ? await openAiSession(agent.instructions, agent.voice, ipHash)
      : { provider: "elevenlabs", signedUrl: await createElevenLabsSignedUrl(agent.providerAgentId) };
  } catch (error) {
    return providerError(error);
  }

  await prisma.voiceDemoSession.create({
    data: {
      agentId: agent.id,
      ipHash,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
  });

  const response = NextResponse.json(body);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

async function openAiSession(instructions: string | null, voice: string | null, ipHash: string) {
  if (!instructions?.trim()) {
    // An OpenAI agent with no prompt would answer as a generic assistant, which
    // is worse than not answering at all on a page behind ad spend.
    throw new OpenAIConfigurationError("This agent has no instructions configured.");
  }

  const { clientSecret, model } = await createRealtimeClientSecret({
    instructions,
    voice,
    // Already a salted hash of the caller's IP — stable per caller, and not
    // something that identifies them to OpenAI.
    safetyIdentifier: ipHash,
  });

  return { provider: "openai", clientSecret, model };
}

function providerError(error: unknown) {
  if (error instanceof ElevenLabsConfigurationError || error instanceof OpenAIConfigurationError) {
    return NextResponse.json({ error: "This demo isn't available right now." }, { status: 503 });
  }
  if (error instanceof ElevenLabsUpstreamError || error instanceof OpenAIUpstreamError) {
    return NextResponse.json({ error: "The demo line is busy. Try again in a moment." }, { status: 503 });
  }
  console.error("[Demo API]", error instanceof Error ? error.message : "unknown error");
  return NextResponse.json({ error: "The demo could not be started." }, { status: 500 });
}
