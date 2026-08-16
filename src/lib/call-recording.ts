import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadObject } from "@/lib/r2";
import { fetchTwilioRecording, type TwilioVoiceConfig } from "@/lib/twilio-voice";
import { splitWavChannels } from "@/lib/wav";
import { transcribeAudio, transcriptionConfigured, type TranscriptSegment } from "@/lib/transcribe";
import { callSummaryConfigured, draftCallLog } from "@/lib/call-summary";

// Turning a finished call into a row the CRM can show.
//
// An outbound call a person placed is archived into the same tables the AI
// receptionist writes to, so /receptionist becomes every call rather than only
// the robot ones. `source` is what tells them apart.

export const COLD_CALL_SOURCE = "cold-call";

// Twilio records the parent leg on channel 1 and the leg it dialled on channel
// 2. The parent here is always the browser, so channel 1 is our rep.
const REP_CHANNEL = 0;

type TranscriptTurn = {
  role: "agent" | "user";
  message: string;
  timeInCallSecs: number;
};

/**
 * Note that a call was placed, before anyone knows how it went.
 *
 * Writing this at dial time rather than at recording time means a call that
 * rang out still leaves a trace — those are the ones that otherwise vanish.
 */
export async function recordColdCallAttempt({
  callSid,
  userId,
  leadId,
  toPhone,
  fromPhone,
}: {
  callSid: string;
  userId: string | null;
  leadId: string | null;
  toPhone: string | null;
  fromPhone: string | null;
}) {
  const agentName = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { name: true } }))?.name ?? null
    : null;

  await prisma.receptionistConversation.upsert({
    where: { providerConversationId: callSid },
    create: {
      providerConversationId: callSid,
      source: COLD_CALL_SOURCE,
      // No AI agent behind a human call. The teammate's name goes in agentName
      // so the existing conversation list stays readable without changes.
      agentId: null,
      agentName,
      userId,
      leadId,
      status: "dialing",
      direction: "outbound",
      initiationSource: "cold-call-room",
      // For an outbound call the other party is the prospect; agentPhone is the
      // number they saw ring.
      callerPhone: toPhone,
      agentPhone: fromPhone,
      startedAt: new Date(),
    },
    update: {},
  });
}

/** Interleave two single-speaker transcripts back into one conversation. */
function mergeChannels(perChannel: TranscriptSegment[][]): TranscriptTurn[] {
  const turns: TranscriptTurn[] = [];

  perChannel.forEach((segments, channel) => {
    const role: TranscriptTurn["role"] = channel === REP_CHANNEL ? "agent" : "user";
    for (const segment of segments) {
      turns.push({ role, message: segment.text, timeInCallSecs: segment.start });
    }
  });

  // Both channels start at the same instant, so their own timestamps are
  // already a shared clock — sorting on them rebuilds the real order.
  return turns.sort((a, b) => a.timeInCallSecs - b.timeInCallSecs);
}

function transcriptText(turns: TranscriptTurn[]) {
  return turns
    .map((turn) => `${turn.role === "agent" ? "AGENT" : "PROSPECT"}: ${turn.message}`)
    .join("\n");
}

/**
 * Fetch, store, transcribe and summarise one recording, then write it into the
 * conversation archive.
 *
 * Runs after the webhook has already answered Twilio — a slow transcription
 * must never turn into a retried delivery.
 */
export async function archiveColdCallRecording({
  callSid,
  recordingSid,
  recordingUrl,
  durationSecs,
  config,
}: {
  callSid: string;
  recordingSid: string;
  recordingUrl: string;
  durationSecs: number;
  // Whichever account placed the call. Twilio serves its recordings behind that
  // same account's auth, so the media can only be fetched with these.
  config: TwilioVoiceConfig;
}) {
  const conversation = await prisma.receptionistConversation.findUnique({
    where: { providerConversationId: callSid },
    select: { id: true, leadId: true, lead: { select: { businessName: true } } },
  });

  const fail = async (message: string) => {
    console.error("[Cold call recording]", callSid, message);
    if (!conversation) return;
    await prisma.receptionistConversation
      .update({
        where: { id: conversation.id },
        data: { status: "failed", processingError: message, detailSyncedAt: new Date() },
      })
      .catch(() => {
        // The original failure is the one worth surfacing.
      });
  };

  if (!conversation) {
    // The dial-time row is what carries the rep and the lead. Without it there
    // is nothing meaningful to attach this audio to.
    console.error("[Cold call recording] No call on file for", callSid);
    return;
  }

  try {
    const audio = await fetchTwilioRecording(recordingUrl, config);

    // Keep the original before doing anything clever with it — if transcription
    // breaks, the recording is still there to listen to.
    const recordingKey = `cold-calls/${callSid}/${recordingSid}.wav`;
    await uploadObject(recordingKey, audio, "audio/wav");
    await prisma.receptionistConversation.update({
      where: { id: conversation.id },
      data: {
        recordingKey,
        hasAudio: true,
        durationSecs: Math.max(0, Math.round(durationSecs)),
        status: "transcribing",
      },
    });

    if (!transcriptionConfigured()) {
      await fail("Recording saved, but OPENAI_API_KEY is not set so it wasn't transcribed.");
      return;
    }

    const channels = splitWavChannels(audio);
    const perChannel = await Promise.all(
      channels.map((channel, index) => transcribeAudio(channel, `${callSid}-ch${index + 1}.wav`)),
    );

    const turns = mergeChannels(perChannel);
    if (!turns.length) {
      await fail("The recording transcribed to nothing — most likely silence.");
      return;
    }

    const transcript = transcriptText(turns);
    const businessName = conversation.lead?.businessName ?? null;

    let draft = null;
    let draftError: string | null = null;
    if (callSummaryConfigured()) {
      try {
        draft = await draftCallLog({ transcript, businessName, today: new Date() });
      } catch (error) {
        // A missing summary is survivable; the transcript is the durable part.
        draftError = error instanceof Error ? error.message : "The draft step failed.";
      }
    }

    const searchText = [draft?.title, draft?.summary, businessName, transcript]
      .filter(Boolean)
      .join("\n");

    await prisma.$transaction(async (tx) => {
      await tx.receptionistConversation.update({
        where: { id: conversation.id },
        data: {
          status: "done",
          title: draft?.title ?? null,
          summary: draft?.summary ?? null,
          searchText,
          sentimentLabel: draft?.sentiment ?? null,
          analysis: (draft ? (draft as unknown as Prisma.InputJsonValue) : undefined),
          messageCount: turns.length,
          endedAt: new Date(),
          detailStatus: "done",
          detailSyncedAt: new Date(),
          processingError: draftError,
        },
      });

      // Re-running a recording callback should replace the transcript, not
      // stack a second copy of it underneath the first.
      await tx.receptionistMessage.deleteMany({ where: { conversationId: conversation.id } });
      await tx.receptionistMessage.createMany({
        data: turns.map((turn, sequence) => ({
          conversationId: conversation.id,
          sequence,
          role: turn.role,
          message: turn.message,
          timeInCallSecs: turn.timeInCallSecs,
        })),
      });
    });
  } catch (error) {
    await fail(error instanceof Error ? error.message : "Processing the recording failed.");
  }
}
