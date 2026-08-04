import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ElevenLabsConfigurationError,
  ElevenLabsUpstreamError,
  createElevenLabsSignedUrl,
} from "@/lib/elevenlabs";
import { checkDemoRateLimit, clientIpFrom, hashIp } from "@/lib/voice-agents";

// Public. Hands a browser a short-lived credential to talk to one demo agent.
// Every guard that keeps this from becoming an open tap on paid voice minutes
// lives here: the per-agent demo toggle, then the rate limit, then the ledger
// row. The API key itself never leaves the server.
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const agent = await prisma.voiceAgent.findUnique({
    where: { slug },
    select: { id: true, providerAgentId: true, demoEnabled: true, isArchived: true },
  });

  if (!agent || !agent.demoEnabled || agent.isArchived) {
    return NextResponse.json({ error: "This demo isn't available." }, { status: 404 });
  }

  const ipHash = hashIp(clientIpFrom(req.headers));
  const verdict = await checkDemoRateLimit(agent.id, ipHash);
  if (!verdict.allowed) {
    return NextResponse.json({ error: verdict.reason }, { status: 429 });
  }

  let signedUrl: string;
  try {
    signedUrl = await createElevenLabsSignedUrl(agent.providerAgentId);
  } catch (error) {
    if (error instanceof ElevenLabsConfigurationError) {
      return NextResponse.json({ error: "This demo isn't available right now." }, { status: 503 });
    }
    if (error instanceof ElevenLabsUpstreamError) {
      return NextResponse.json({ error: "The demo line is busy. Try again in a moment." }, { status: 503 });
    }
    console.error("[Demo API]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "The demo could not be started." }, { status: 500 });
  }

  await prisma.voiceDemoSession.create({
    data: {
      agentId: agent.id,
      ipHash,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
  });

  const response = NextResponse.json({ signedUrl });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
