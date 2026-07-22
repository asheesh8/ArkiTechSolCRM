import "server-only";

import { Prisma, type ReceptionistConversation } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1/convai";
const TERMINAL_STATUSES = new Set(["done", "failed"]);
const FULL_RECONCILE_INTERVAL_MS = 7 * 24 * 60 * 60 * 1_000;

const conversationSummarySchema = z.object({
  agent_id: z.string(),
  conversation_id: z.string(),
  start_time_unix_secs: z.number(),
  call_duration_secs: z.number().default(0),
  message_count: z.number().int().default(0),
  status: z.string(),
  call_successful: z.string().nullable().optional(),
  call_success_score: z.number().nullable().optional(),
  agent_name: z.string().nullable().optional(),
  termination_reason: z.string().nullable().optional(),
  transcript_summary: z.string().nullable().optional(),
  call_summary_title: z.string().nullable().optional(),
  main_language: z.string().nullable().optional(),
  conversation_initiation_source: z.string().nullable().optional(),
  direction: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  sentiment_analysis: z.unknown().nullable().optional(),
  tag_ids: z.array(z.string()).optional(),
}).passthrough();

const conversationListSchema = z.object({
  conversations: z.array(conversationSummarySchema),
  has_more: z.boolean(),
  next_cursor: z.string().nullable().optional(),
});

const transcriptTurnSchema = z.object({
  role: z.string(),
  message: z.string().nullable().optional(),
  time_in_call_secs: z.number().nullable().optional(),
  interrupted: z.boolean().optional(),
  source_medium: z.string().nullable().optional(),
}).passthrough();

const jsonRecordSchema = z.record(z.string(), z.unknown());

const conversationDetailSchema = z.object({
  agent_id: z.string(),
  agent_name: z.string().nullable().optional(),
  status: z.string(),
  conversation_id: z.string(),
  metadata: jsonRecordSchema,
  analysis: jsonRecordSchema.nullable().optional(),
  conversation_initiation_client_data: jsonRecordSchema.nullable().optional(),
  environment: z.string().nullable().optional(),
  has_audio: z.boolean(),
  transcript: z.array(transcriptTurnSchema),
  tag_ids: z.array(z.string()).optional(),
}).passthrough();

type ConversationSummary = z.infer<typeof conversationSummarySchema>;
type ConversationDetail = z.infer<typeof conversationDetailSchema>;

export type ReceptionistSyncResult = {
  scanned: number;
  archived: number;
  refreshed: number;
  unchanged: number;
  errors: number;
};

export class ElevenLabsConfigurationError extends Error {}

export class ElevenLabsWebhookPayloadError extends Error {}

export class ElevenLabsUpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function getConfig() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const agentId = process.env.ELEVENLABS_AGENT_ID?.trim();

  if (!apiKey || !agentId) {
    throw new ElevenLabsConfigurationError("ElevenLabs receptionist configuration is incomplete.");
  }

  return { apiKey, agentId };
}

async function elevenLabsJson<T>(path: string, schema: z.ZodType<T>) {
  const { apiKey } = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}${path}`, {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ElevenLabsUpstreamError(`ElevenLabs returned HTTP ${response.status}.`, response.status);
    }

    const payload: unknown = await response.json();
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new ElevenLabsUpstreamError("ElevenLabs returned an unexpected response.", 502);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ElevenLabsUpstreamError || error instanceof ElevenLabsConfigurationError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ElevenLabsUpstreamError("ElevenLabs timed out.", 504);
    }
    throw new ElevenLabsUpstreamError("ElevenLabs could not be reached.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function listAllConversationSummaries(callStartAfterUnix?: number) {
  const { agentId } = getConfig();
  const conversations: ConversationSummary[] = [];
  let cursor: string | null = null;
  let pages = 0;

  do {
    const search = new URLSearchParams({
      agent_id: agentId,
      page_size: "100",
      summary_mode: "include",
    });
    if (cursor) search.set("cursor", cursor);
    if (callStartAfterUnix != null) {
      search.set("call_start_after_unix", String(callStartAfterUnix));
    }

    const page = await elevenLabsJson(`/conversations?${search.toString()}`, conversationListSchema);
    conversations.push(...page.conversations);
    cursor = page.has_more ? page.next_cursor ?? null : null;
    pages += 1;
  } while (cursor && pages < 100);

  if (cursor) {
    throw new ElevenLabsUpstreamError(
      "The receptionist backfill exceeds the safe per-request page limit.",
      503,
    );
  }

  return conversations;
}

export function getElevenLabsConversation(conversationId: string) {
  return elevenLabsJson(
    `/conversations/${encodeURIComponent(conversationId)}?format=json`,
    conversationDetailSchema,
  );
}

export async function getElevenLabsAudio(conversationId: string, range?: string | null) {
  const { apiKey } = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(
      `${ELEVENLABS_BASE_URL}/conversations/${encodeURIComponent(conversationId)}/audio`,
      {
        headers: {
          "xi-api-key": apiKey,
          ...(range ? { Range: range } : {}),
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new ElevenLabsUpstreamError(`ElevenLabs audio returned HTTP ${response.status}.`, response.status);
    }

    return response;
  } catch (error) {
    if (error instanceof ElevenLabsUpstreamError || error instanceof ElevenLabsConfigurationError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ElevenLabsUpstreamError("ElevenLabs audio timed out.", 504);
    }
    throw new ElevenLabsUpstreamError("ElevenLabs audio could not be reached.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function asNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function phoneKey(value: string | null | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function jsonValue(value: unknown) {
  return value == null ? Prisma.DbNull : value as Prisma.InputJsonValue;
}

function sentimentLabel(value: unknown) {
  return asString(asRecord(value).overall_label);
}

function summaryFields(summary: ConversationSummary) {
  const startedAt = new Date(summary.start_time_unix_secs * 1_000);
  const durationSecs = Math.max(0, Math.round(summary.call_duration_secs || 0));

  return {
    agentId: summary.agent_id,
    agentName: summary.agent_name ?? null,
    status: summary.status,
    callSuccessful: summary.call_successful ?? null,
    callSuccessScore: summary.call_success_score ?? null,
    title: summary.call_summary_title ?? null,
    summary: summary.transcript_summary ?? null,
    direction: summary.direction ?? null,
    initiationSource: summary.conversation_initiation_source ?? null,
    mainLanguage: summary.main_language ?? null,
    terminationReason: summary.termination_reason || null,
    durationSecs,
    messageCount: Math.max(0, summary.message_count || 0),
    startedAt,
    endedAt: durationSecs ? new Date(startedAt.getTime() + durationSecs * 1_000) : null,
    rating: summary.rating ?? null,
    sentimentLabel: sentimentLabel(summary.sentiment_analysis),
    tagIds: summary.tag_ids ?? [],
    syncedAt: new Date(),
  };
}

function summaryFromDetail(detail: ConversationDetail): ConversationSummary {
  const metadata = detail.metadata;
  const analysis = asRecord(detail.analysis);
  const phoneCall = asRecord(metadata.phone_call);
  const feedback = asRecord(metadata.feedback);

  return conversationSummarySchema.parse({
    agent_id: detail.agent_id,
    agent_name: detail.agent_name ?? null,
    conversation_id: detail.conversation_id,
    start_time_unix_secs: asNumber(metadata.start_time_unix_secs) ?? Math.floor(Date.now() / 1_000),
    call_duration_secs: asNumber(metadata.call_duration_secs) ?? 0,
    message_count: detail.transcript.length,
    status: detail.status,
    call_successful: asString(analysis.call_successful),
    call_success_score: asNumber(analysis.call_success_score),
    termination_reason: asString(metadata.termination_reason),
    transcript_summary: asString(analysis.transcript_summary),
    call_summary_title: asString(analysis.call_summary_title),
    main_language: asString(metadata.main_language),
    conversation_initiation_source: asString(metadata.conversation_initiation_source),
    direction: asString(phoneCall.direction),
    rating: asNumber(feedback.rating, feedback.overall_score),
    sentiment_analysis: analysis.sentiment_analysis ?? null,
    tag_ids: detail.tag_ids,
  });
}

async function getUniqueLeadIdsByPhone() {
  const leads = await prisma.lead.findMany({
    where: { phone: { not: null } },
    select: { id: true, phone: true },
  });
  const leadCandidatesByPhone = new Map<string, string[]>();
  for (const lead of leads) {
    const key = phoneKey(lead.phone);
    if (!key) continue;
    leadCandidatesByPhone.set(key, [...(leadCandidatesByPhone.get(key) ?? []), lead.id]);
  }

  const leadIdsByPhone = new Map<string, string>();
  for (const [key, candidates] of leadCandidatesByPhone) {
    if (candidates.length === 1) leadIdsByPhone.set(key, candidates[0]);
  }
  return leadIdsByPhone;
}

async function archiveSummary(summary: ConversationSummary) {
  const fields = summaryFields(summary);
  return prisma.receptionistConversation.upsert({
    where: { providerConversationId: summary.conversation_id },
    create: {
      providerConversationId: summary.conversation_id,
      ...fields,
      searchText: [fields.title, fields.summary].filter(Boolean).join("\n"),
    },
    update: {
      agentId: fields.agentId,
      status: fields.status,
      durationSecs: fields.durationSecs,
      messageCount: fields.messageCount,
      startedAt: fields.startedAt,
      endedAt: fields.endedAt,
      detailStatus: null,
      detailSyncedAt: null,
      syncedAt: fields.syncedAt,
    },
  });
}

async function archiveDetail(
  summary: ConversationSummary,
  detail: ConversationDetail,
  leadIdsByPhone: Map<string, string>,
) {
  const metadata = detail.metadata;
  const analysis = asRecord(detail.analysis);
  const phoneCall = asRecord(metadata.phone_call);
  const initiationData = asRecord(detail.conversation_initiation_client_data);
  const dynamicVariables = asRecord(initiationData.dynamic_variables);
  const callerPhone = asString(phoneCall.external_number, dynamicVariables.system__caller_id);
  const agentPhone = asString(phoneCall.agent_number, dynamicVariables.system__called_number);
  const callerKey = phoneKey(callerPhone);
  const leadId = callerKey ? leadIdsByPhone.get(callerKey) : undefined;
  const fields = summaryFields(summary);
  const title = asString(analysis.call_summary_title, fields.title);
  const transcriptSummary = asString(analysis.transcript_summary, fields.summary);
  const detailDuration = asNumber(metadata.call_duration_secs);
  const durationSecs = detailDuration == null ? fields.durationSecs : Math.max(0, Math.round(detailDuration));
  const startUnix = asNumber(metadata.start_time_unix_secs) ?? summary.start_time_unix_secs;
  const startedAt = new Date(startUnix * 1_000);
  const callSuccessful = asString(analysis.call_successful, fields.callSuccessful);
  const callSuccessScore = asNumber(analysis.call_success_score, fields.callSuccessScore);
  const direction = asString(phoneCall.direction, fields.direction);
  const initiationSource = asString(metadata.conversation_initiation_source, fields.initiationSource);
  const mainLanguage = asString(metadata.main_language, fields.mainLanguage);
  const terminationReason = asString(metadata.termination_reason, fields.terminationReason);
  const detailSentiment = asRecord(analysis.sentiment_analysis);
  const messageCount = Math.max(summary.message_count || 0, detail.transcript.length);
  const detailSyncedAt = new Date();
  const messages = detail.transcript.map((turn, sequence) => ({
    sequence,
    role: turn.role,
    message: turn.message ?? null,
    timeInCallSecs: turn.time_in_call_secs ?? null,
    interrupted: turn.interrupted ?? false,
    sourceMedium: turn.source_medium ?? null,
    rawData: turn as Prisma.InputJsonValue,
  }));
  const searchText = [
    title,
    transcriptSummary,
    callerPhone,
    agentPhone,
    ...messages.map((message) => message.message),
  ].filter(Boolean).join("\n");

  return prisma.$transaction(async (transaction) => {
    const conversation = await transaction.receptionistConversation.upsert({
      where: { providerConversationId: detail.conversation_id },
      create: {
        providerConversationId: detail.conversation_id,
        agentId: detail.agent_id,
        agentName: detail.agent_name ?? fields.agentName,
        status: detail.status,
        callSuccessful,
        callSuccessScore,
        title,
        summary: transcriptSummary,
        searchText,
        callerPhone,
        agentPhone,
        direction,
        initiationSource,
        mainLanguage,
        terminationReason,
        durationSecs,
        messageCount,
        startedAt,
        endedAt: durationSecs ? new Date(startedAt.getTime() + durationSecs * 1_000) : null,
        hasAudio: detail.has_audio,
        costFiat: asNumber(metadata.cost_fiat),
        rating: fields.rating,
        sentimentLabel: asString(detailSentiment.overall_label, fields.sentimentLabel),
        metadata: jsonValue(detail.metadata),
        analysis: jsonValue(detail.analysis),
        initiationData: jsonValue(detail.conversation_initiation_client_data),
        tagIds: detail.tag_ids ?? fields.tagIds,
        leadId,
        detailStatus: detail.status,
        detailSyncedAt,
        syncedAt: detailSyncedAt,
      },
      update: {
        agentId: detail.agent_id,
        agentName: detail.agent_name ?? fields.agentName,
        status: detail.status,
        callSuccessful,
        callSuccessScore,
        title,
        summary: transcriptSummary,
        searchText,
        callerPhone,
        agentPhone,
        direction,
        initiationSource,
        mainLanguage,
        terminationReason,
        durationSecs,
        messageCount,
        startedAt,
        endedAt: durationSecs ? new Date(startedAt.getTime() + durationSecs * 1_000) : null,
        hasAudio: detail.has_audio,
        costFiat: asNumber(metadata.cost_fiat),
        rating: fields.rating,
        sentimentLabel: asString(detailSentiment.overall_label, fields.sentimentLabel),
        metadata: jsonValue(detail.metadata),
        analysis: jsonValue(detail.analysis),
        initiationData: jsonValue(detail.conversation_initiation_client_data),
        tagIds: detail.tag_ids ?? fields.tagIds,
        ...(leadId ? { leadId } : {}),
        detailStatus: detail.status,
        detailSyncedAt,
        syncedAt: detailSyncedAt,
      },
    });

    await transaction.receptionistMessage.deleteMany({ where: { conversationId: conversation.id } });
    if (messages.length) {
      await transaction.receptionistMessage.createMany({
        data: messages.map((message) => ({ ...message, conversationId: conversation.id })),
      });
    }

    return conversation;
  });
}

export async function archiveReceptionistWebhookConversation(payload: unknown) {
  const parsed = conversationDetailSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ElevenLabsWebhookPayloadError("The webhook conversation payload is invalid.");
  }

  const configuredAgentId = process.env.ELEVENLABS_AGENT_ID?.trim();
  if (!configuredAgentId) {
    throw new ElevenLabsConfigurationError("The receptionist agent ID is not configured.");
  }
  if (parsed.data.agent_id !== configuredAgentId) return { ignored: true as const };

  const leadIdsByPhone = await getUniqueLeadIdsByPhone();
  const summary = summaryFromDetail(parsed.data);
  const conversation = await archiveDetail(summary, parsed.data, leadIdsByPhone);
  return { ignored: false as const, conversationId: conversation.id };
}

async function mapWithConcurrency<T>(items: T[], concurrency: number, run: (item: T) => Promise<void>) {
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;
      await run(item);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
}

async function performSync(): Promise<ReceptionistSyncResult> {
  const { agentId } = getConfig();
  const [latestStored, incompleteStored, syncState] = await Promise.all([
    prisma.receptionistConversation.findFirst({
      where: { agentId },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true },
    }),
    prisma.receptionistConversation.findMany({
      where: {
        agentId,
        OR: [
          { metadata: { equals: Prisma.DbNull } },
          { detailStatus: null },
          { status: { notIn: [...TERMINAL_STATUSES] } },
        ],
      },
      select: {
        providerConversationId: true,
        agentId: true,
        agentName: true,
        status: true,
        callSuccessful: true,
        callSuccessScore: true,
        title: true,
        summary: true,
        direction: true,
        initiationSource: true,
        mainLanguage: true,
        terminationReason: true,
        durationSecs: true,
        messageCount: true,
        startedAt: true,
        rating: true,
        sentimentLabel: true,
        tagIds: true,
      },
    }),
    prisma.receptionistSyncState.findUnique({ where: { agentId } }),
  ]);
  // Re-scan a 24-hour overlap so calls that were in progress during the prior
  // sync still receive their final transcript and analysis.
  const shouldFullyReconcile =
    !syncState?.lastFullReconcileAt ||
    Date.now() - syncState.lastFullReconcileAt.getTime() >= FULL_RECONCILE_INTERVAL_MS;
  const callStartAfterUnix = !shouldFullyReconcile && latestStored
    ? Math.max(0, Math.floor(latestStored.startedAt.getTime() / 1_000) - 86_400)
    : undefined;
  const summaries = await listAllConversationSummaries(callStartAfterUnix);
  const listedProviderIds = new Set(summaries.map((summary) => summary.conversation_id));
  for (const conversation of incompleteStored) {
    if (listedProviderIds.has(conversation.providerConversationId)) continue;
    summaries.push(conversationSummarySchema.parse({
      agent_id: conversation.agentId,
      agent_name: conversation.agentName,
      conversation_id: conversation.providerConversationId,
      start_time_unix_secs: Math.floor(conversation.startedAt.getTime() / 1_000),
      call_duration_secs: conversation.durationSecs,
      message_count: conversation.messageCount,
      status: conversation.status,
      call_successful: conversation.callSuccessful,
      call_success_score: conversation.callSuccessScore,
      termination_reason: conversation.terminationReason,
      transcript_summary: conversation.summary,
      call_summary_title: conversation.title,
      main_language: conversation.mainLanguage,
      conversation_initiation_source: conversation.initiationSource,
      direction: conversation.direction,
      rating: conversation.rating,
      sentiment_analysis: conversation.sentimentLabel
        ? { overall_label: conversation.sentimentLabel }
        : null,
      tag_ids: conversation.tagIds,
    }));
  }
  const [existingConversations, leadIdsByPhone] = await Promise.all([
    prisma.receptionistConversation.findMany({
      where: {
        agentId,
        providerConversationId: { in: summaries.map((summary) => summary.conversation_id) },
      },
      select: {
        id: true,
        providerConversationId: true,
        status: true,
        title: true,
        summary: true,
        messageCount: true,
        metadata: true,
        detailStatus: true,
        _count: { select: { messages: true } },
      },
    }),
    getUniqueLeadIdsByPhone(),
  ]);
  const existingByProviderId = new Map(existingConversations.map((conversation) => [conversation.providerConversationId, conversation]));
  const result: ReceptionistSyncResult = {
    scanned: summaries.length,
    archived: 0,
    refreshed: 0,
    unchanged: 0,
    errors: 0,
  };

  await mapWithConcurrency(summaries, 4, async (summary) => {
    const existing = existingByProviderId.get(summary.conversation_id);
    const needsDetail =
      !existing ||
      existing.metadata === null ||
      existing.detailStatus !== summary.status ||
      !TERMINAL_STATUSES.has(summary.status) ||
      existing.status !== summary.status ||
      existing.title !== (summary.call_summary_title ?? null) ||
      existing.summary !== (summary.transcript_summary ?? null) ||
      existing.messageCount !== summary.message_count ||
      existing._count.messages < summary.message_count;

    if (!needsDetail) {
      result.unchanged += 1;
      return;
    }

    try {
      const detail = await getElevenLabsConversation(summary.conversation_id);
      await archiveDetail(summary, detail, leadIdsByPhone);
      if (existing) result.refreshed += 1;
      else result.archived += 1;
    } catch (error) {
      console.error(
        `[ElevenLabs sync] Unable to archive conversation ${summary.conversation_id}:`,
        error instanceof Error ? error.message : "unknown error",
      );
      await archiveSummary(summary);
      result.errors += 1;
    }
  });

  const completedAt = new Date();
  await prisma.receptionistSyncState.upsert({
    where: { agentId },
    create: {
      agentId,
      lastIncrementalAt: completedAt,
      lastFullReconcileAt: shouldFullyReconcile ? completedAt : null,
    },
    update: {
      lastIncrementalAt: completedAt,
      ...(shouldFullyReconcile ? { lastFullReconcileAt: completedAt } : {}),
    },
  });

  return result;
}

let activeSync: Promise<ReceptionistSyncResult> | null = null;

export function syncReceptionistConversations() {
  if (!activeSync) {
    activeSync = performSync().finally(() => {
      activeSync = null;
    });
  }
  return activeSync;
}

export function publicConversationFields(conversation: ReceptionistConversation) {
  return {
    id: conversation.id,
    title: conversation.title,
    summary: conversation.summary,
    callerPhone: conversation.callerPhone,
    agentPhone: conversation.agentPhone,
    status: conversation.status,
    callSuccessful: conversation.callSuccessful,
    callSuccessScore: conversation.callSuccessScore,
    startedAt: conversation.startedAt,
    endedAt: conversation.endedAt,
    durationSecs: conversation.durationSecs,
    messageCount: conversation.messageCount,
    hasAudio: conversation.hasAudio,
    direction: conversation.direction,
    initiationSource: conversation.initiationSource,
    mainLanguage: conversation.mainLanguage,
    terminationReason: conversation.terminationReason,
    rating: conversation.rating,
    sentimentLabel: conversation.sentimentLabel,
    syncedAt: conversation.syncedAt,
  };
}
