import "server-only";

import type { CallOutcome, NoteType } from "@prisma/client";

// Turning a transcript into the log a person would have written.
//
// A transcript is not a log — nobody re-reads ten minutes of talking to
// remember what was agreed. What matters is the handful of things a rep would
// have typed anyway, and the schema already names most of them, so the model is
// asked for exactly those fields and nothing else.

const CHAT_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_SUMMARY_MODEL?.trim() || "gpt-4o-mini";

export class CallSummaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CallSummaryError";
  }
}

/** Matches the wrap-up buttons in the cold-call room, not the database enum. */
export const DRAFT_OUTCOMES = [
  "no-answer",
  "voicemail",
  "warm",
  "follow-up",
  "booked",
  "not-interested",
] as const;

export type DraftOutcome = (typeof DRAFT_OUTCOMES)[number];

export type CallDraft = {
  title: string;
  summary: string;
  outcome: DraftOutcome;
  /** The note body the rep sees pre-written in the wrap-up card. */
  note: string;
  /** YYYY-MM-DD, only when something specific was actually agreed. */
  followUpDate: string | null;
  /** The objection actually raised, in the caller's own framing. */
  objection: string | null;
  sentiment: "positive" | "neutral" | "negative";
  /** Anything either side promised to do. */
  commitments: string[];
};

const OUTCOME_TO_CRM: Record<DraftOutcome, { callOutcome: CallOutcome; noteType: NoteType }> = {
  "no-answer": { callOutcome: "NO_ANSWER", noteType: "GENERAL" },
  voicemail: { callOutcome: "LEFT_VOICEMAIL", noteType: "GENERAL" },
  warm: { callOutcome: "CALLED", noteType: "GENERAL" },
  "follow-up": { callOutcome: "FOLLOW_UP", noteType: "FOLLOW_UP" },
  booked: { callOutcome: "MEETING_BOOKED", noteType: "MEETING" },
  "not-interested": { callOutcome: "NOT_INTERESTED", noteType: "GENERAL" },
};

/** Translate a draft outcome into the enums the notes route expects. */
export function draftOutcomeToCrm(outcome: string) {
  return OUTCOME_TO_CRM[outcome as DraftOutcome] ?? null;
}

const DRAFT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "outcome", "note", "followUpDate", "objection", "sentiment", "commitments"],
  properties: {
    title: { type: "string", description: "Six words or fewer naming what this call was." },
    summary: { type: "string", description: "Two sentences: what happened and where it landed." },
    outcome: { type: "string", enum: [...DRAFT_OUTCOMES] },
    note: {
      type: "string",
      description:
        "The note a salesperson would type after this call: the pain point, the objection raised, anything promised. Three or four sentences, plain first person, no bullet points, no preamble.",
    },
    followUpDate: {
      type: ["string", "null"],
      description: "YYYY-MM-DD, only if a specific date or day was actually agreed. Null otherwise.",
    },
    objection: {
      type: ["string", "null"],
      description: "The main objection the prospect raised, in their own framing. Null if none.",
    },
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    commitments: {
      type: "array",
      items: { type: "string" },
      description: "Everything either side promised to do next. Empty when nothing was promised.",
    },
  },
} as const;

function getApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new CallSummaryError("OPENAI_API_KEY is not set.");
  return key;
}

export function callSummaryConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * Draft the wrap-up for one call.
 *
 * `today` is passed in rather than read here so "Tuesday" resolves against the
 * day the call actually happened, not whenever the job got around to running.
 */
export async function draftCallLog({
  transcript,
  businessName,
  today,
}: {
  transcript: string;
  businessName?: string | null;
  today: Date;
}): Promise<CallDraft> {
  const trimmed = transcript.trim();
  if (!trimmed) throw new CallSummaryError("There is no transcript to summarise.");

  const isoToday = today.toISOString().slice(0, 10);
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });

  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: [
            "You write up outbound sales calls for a small web agency that sells websites, Google visibility and AI receptionists to local service businesses.",
            `The call happened on ${weekday}, ${isoToday}. Resolve any relative day the parties mention against that date.`,
            "Write the note as the salesperson would: first person, specific, no filler, no restating the whole call.",
            "Only record what was actually said. If the prospect never committed to a date, followUpDate is null. Never invent a price, a name, or a promise.",
            "A call that reached voicemail or was never picked up gets the matching outcome and a one-line note.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            businessName ? `Business called: ${businessName}` : null,
            "",
            "Transcript — AGENT is our salesperson, PROSPECT is the business owner:",
            trimmed,
          ]
            .filter((line) => line !== null)
            .join("\n"),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "call_draft", strict: true, schema: DRAFT_SCHEMA },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new CallSummaryError(
      `Draft failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`,
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new CallSummaryError("The model returned an empty draft.");

  let parsed: CallDraft;
  try {
    parsed = JSON.parse(content) as CallDraft;
  } catch {
    throw new CallSummaryError("The model returned a draft that wasn't valid JSON.");
  }

  // A strict schema still can't promise a real calendar date, and a bad one
  // would put a lead on the accountability board on the wrong day.
  const followUpDate =
    parsed.followUpDate && /^\d{4}-\d{2}-\d{2}$/.test(parsed.followUpDate)
      ? parsed.followUpDate
      : null;

  return {
    ...parsed,
    followUpDate,
    commitments: Array.isArray(parsed.commitments) ? parsed.commitments : [],
  };
}
