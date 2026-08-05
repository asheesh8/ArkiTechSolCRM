import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import {
  ElevenLabsConfigurationError,
  ElevenLabsUpstreamError,
  listElevenLabsAgents,
} from "@/lib/elevenlabs";
import { uniqueSlug } from "@/lib/voice-agents";

async function requireOwner() {
  const user = await getCurrentUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isOwner(user)) {
    return { response: NextResponse.json({ error: "Owner access is required." }, { status: 403 }) };
  }
  return { user };
}

function upstreamError(error: unknown) {
  if (error instanceof ElevenLabsConfigurationError) {
    return NextResponse.json(
      { error: "ElevenLabs is not configured on this deployment." },
      { status: 503 },
    );
  }
  if (error instanceof ElevenLabsUpstreamError) {
    const credentialError = error.status === 401 || error.status === 403;
    return NextResponse.json(
      {
        error: credentialError
          ? "ElevenLabs rejected the API key. Update the server environment and try again."
          : "ElevenLabs is temporarily unavailable. The saved roster is unchanged.",
      },
      { status: credentialError ? 502 : 503 },
    );
  }
  console.error("[Agents API]", error instanceof Error ? error.message : "unknown error");
  return NextResponse.json({ error: "The agent roster could not be loaded." }, { status: 500 });
}

export async function GET() {
  const access = await requireOwner();
  if ("response" in access) return access.response;

  const agents = await prisma.voiceAgent.findMany({
    orderBy: [{ isArchived: "asc" }, { name: "asc" }],
    include: { client: { select: { id: true, businessName: true } } },
  });

  // Call volume comes from the archived conversations, which key on the
  // provider's agent id rather than our row id.
  const counts = await prisma.receptionistConversation.groupBy({
    by: ["agentId"],
    _count: { _all: true },
  });
  const callsByProviderId = new Map(counts.map((row) => [row.agentId, row._count._all]));

  return NextResponse.json({
    agents: agents.map((agent) => ({
      ...agent,
      callCount: callsByProviderId.get(agent.providerAgentId) ?? 0,
    })),
  });
}

// Reconciles the roster against the ElevenLabs account: new agents are added,
// renamed ones are updated, and agents that disappeared upstream are archived
// rather than deleted so their call history survives.
export async function POST() {
  const access = await requireOwner();
  if ("response" in access) return access.response;

  let upstream;
  try {
    upstream = await listElevenLabsAgents();
  } catch (error) {
    return upstreamError(error);
  }

  // Only ElevenLabs-hosted rows are this sync's to reconcile. An OpenAI agent
  // has no upstream counterpart, so including it here would archive it and
  // unpublish its demo on the next sync.
  const existing = await prisma.voiceAgent.findMany({ where: { provider: "elevenlabs" } });
  const existingByProviderId = new Map(existing.map((agent) => [agent.providerAgentId, agent]));
  const upstreamIds = new Set(upstream.map((agent) => agent.agentId));
  const now = new Date();

  let added = 0;
  let updated = 0;

  for (const agent of upstream) {
    const current = existingByProviderId.get(agent.agentId);

    if (!current) {
      await prisma.voiceAgent.create({
        data: {
          providerAgentId: agent.agentId,
          name: agent.name,
          slug: await uniqueSlug(agent.name),
          lastSyncedAt: now,
        },
      });
      added += 1;
      continue;
    }

    // The slug is a published URL — a rename upstream must not break it.
    await prisma.voiceAgent.update({
      where: { id: current.id },
      data: { name: agent.name, isArchived: false, lastSyncedAt: now },
    });
    if (current.name !== agent.name || current.isArchived) updated += 1;
  }

  const removed = existing.filter((agent) => !upstreamIds.has(agent.providerAgentId) && !agent.isArchived);
  if (removed.length) {
    await prisma.voiceAgent.updateMany({
      where: { id: { in: removed.map((agent) => agent.id) } },
      data: { isArchived: true, demoEnabled: false },
    });
  }

  return NextResponse.json({ ok: true, added, updated, archived: removed.length, total: upstream.length });
}
