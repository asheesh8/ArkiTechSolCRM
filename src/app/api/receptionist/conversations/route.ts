import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isManager } from "@/lib/auth";
import {
  ElevenLabsConfigurationError,
  ElevenLabsUpstreamError,
  publicConversationFields,
  syncReceptionistConversations,
} from "@/lib/elevenlabs";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

const querySchema = z.object({
  search: z.string().trim().max(120).catch(""),
  outcome: z.enum(["successful", "failed"]).or(z.literal("")).catch(""),
  source: z.string().trim().max(80).catch(""),
  page: z.coerce.number().int().min(1).catch(1),
});

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

async function requireManager() {
  const user = await getCurrentUser();
  if (!user) return { response: noStoreJson({ error: "Unauthorized" }, { status: 401 }) };
  if (!isManager(user)) {
    return { response: noStoreJson({ error: "Manager access is required." }, { status: 403 }) };
  }
  return { user };
}

function syncErrorResponse(error: unknown) {
  if (error instanceof ElevenLabsConfigurationError) {
    return noStoreJson(
      { error: "The receptionist connection is not configured on this deployment." },
      { status: 503 },
    );
  }

  if (error instanceof ElevenLabsUpstreamError) {
    const credentialError = error.status === 401 || error.status === 403;
    return noStoreJson(
      {
        error: credentialError
          ? "ElevenLabs rejected the receptionist credentials. Update the server environment and try again."
          : "ElevenLabs is temporarily unavailable. Stored conversations are still safe in the CRM.",
      },
      { status: credentialError ? 502 : error.status >= 500 ? 503 : 502 },
    );
  }

  console.error("[Receptionist API] Sync failed:", error instanceof Error ? error.message : "unknown error");
  return noStoreJson({ error: "The receptionist sync could not be completed." }, { status: 500 });
}

export async function GET(request: Request) {
  const access = await requireManager();
  if ("response" in access) return access.response;

  const url = new URL(request.url);
  const query = querySchema.parse({
    search: url.searchParams.get("search") ?? "",
    outcome: url.searchParams.get("outcome") ?? "",
    source: url.searchParams.get("source") ?? "",
    page: url.searchParams.get("page") ?? "1",
  });
  const configuredAgentId = process.env.ELEVENLABS_AGENT_ID?.trim();
  const agentWhere: Prisma.ReceptionistConversationWhereInput = configuredAgentId
    ? { agentId: configuredAgentId }
    : {};
  const where: Prisma.ReceptionistConversationWhereInput = {
    ...agentWhere,
    ...(query.outcome === "successful"
      ? { callSuccessful: "success" }
      : query.outcome === "failed"
        ? { callSuccessful: "failure" }
        : {}),
    ...(query.source ? { initiationSource: query.source } : {}),
    ...(query.search
      ? {
          OR: [
            { searchText: { contains: query.search, mode: "insensitive" } },
            { title: { contains: query.search, mode: "insensitive" } },
            { summary: { contains: query.search, mode: "insensitive" } },
            { callerPhone: { contains: query.search } },
            { agentPhone: { contains: query.search } },
            { lead: { businessName: { contains: query.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const total = await prisma.receptionistConversation.count({ where });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const [conversations, aggregate, successful, failed, latest, sources] = await Promise.all([
    prisma.receptionistConversation.findMany({
      where,
      orderBy: [{ startedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { lead: { select: { id: true, businessName: true } } },
    }),
    prisma.receptionistConversation.aggregate({
      where: agentWhere,
      _count: { _all: true },
      _sum: { durationSecs: true },
      _avg: { durationSecs: true },
    }),
    prisma.receptionistConversation.count({ where: { ...agentWhere, callSuccessful: "success" } }),
    prisma.receptionistConversation.count({ where: { ...agentWhere, callSuccessful: "failure" } }),
    prisma.receptionistConversation.findFirst({
      where: agentWhere,
      orderBy: { syncedAt: "desc" },
      select: { syncedAt: true, agentName: true },
    }),
    prisma.receptionistConversation.findMany({
      where: { ...agentWhere, initiationSource: { not: null } },
      distinct: ["initiationSource"],
      select: { initiationSource: true },
      orderBy: { initiationSource: "asc" },
    }),
  ]);
  return noStoreJson({
    conversations: conversations.map((conversation) => ({
      ...publicConversationFields(conversation),
      lead: conversation.lead,
    })),
    stats: {
      total: aggregate._count._all,
      successful,
      failed,
      totalSeconds: aggregate._sum.durationSecs ?? 0,
      avgDurationSecs: Math.round(aggregate._avg.durationSecs ?? 0),
    },
    pagination: { page, pageSize: PAGE_SIZE, total, pages },
    lastSyncedAt: latest?.syncedAt ?? null,
    agentName: latest?.agentName ?? null,
    sources: sources.flatMap(({ initiationSource }) => initiationSource ? [initiationSource] : []),
  });
}

export async function POST() {
  const access = await requireManager();
  if ("response" in access) return access.response;

  try {
    const sync = await syncReceptionistConversations();
    return noStoreJson(
      { sync },
      sync.errors ? { status: 207 } : undefined,
    );
  } catch (error) {
    return syncErrorResponse(error);
  }
}
