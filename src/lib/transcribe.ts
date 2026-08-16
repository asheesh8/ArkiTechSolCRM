import "server-only";

// Speech to text for call recordings.
//
// This is deliberately one small function behind one small type. The whole
// point is that the rest of the call pipeline never learns who does the
// transcribing: today it is the OpenAI key the project already holds, and the
// day the monthly bill justifies a GPU box, a self-hosted faster-whisper server
// replaces the body of `transcribeAudio` and nothing else changes.

const TRANSCRIBE_URL = "https://api.openai.com/v1/audio/transcriptions";

// whisper-1 is the model that returns segment timestamps, which is what lets
// two separately-transcribed channels be merged back into one ordered
// conversation. A newer model without `verbose_json` would lose that.
const MODEL = process.env.OPENAI_TRANSCRIBE_MODEL?.trim() || "whisper-1";

export class TranscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranscriptionError";
  }
}

export type TranscriptSegment = {
  /** Seconds from the start of this channel's audio. */
  start: number;
  end: number;
  text: string;
};

function getApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new TranscriptionError("OPENAI_API_KEY is not set.");
  return key;
}

export function transcriptionConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * Transcribe one mono audio file into timestamped segments.
 *
 * Callers pass a single speaker's channel, so nothing here needs to work out
 * who is talking — that question was already answered by recording each leg of
 * the call separately.
 */
export async function transcribeAudio(audio: Buffer, filename: string): Promise<TranscriptSegment[]> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio)], { type: "audio/wav" }), filename);
  form.append("model", MODEL);
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "segment");

  const response = await fetch(TRANSCRIBE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${getApiKey()}` },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new TranscriptionError(
      `Transcription failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`,
    );
  }

  const data = (await response.json()) as {
    text?: string;
    segments?: { start?: number; end?: number; text?: string }[];
  };

  if (Array.isArray(data.segments) && data.segments.length) {
    return data.segments
      .map((segment) => ({
        start: Number(segment.start ?? 0),
        end: Number(segment.end ?? 0),
        text: (segment.text ?? "").trim(),
      }))
      .filter((segment) => segment.text.length > 0);
  }

  // A very short channel can come back as plain text with no segments. One
  // segment covering the whole clip keeps the merge step simple.
  const text = (data.text ?? "").trim();
  return text ? [{ start: 0, end: 0, text }] : [];
}
