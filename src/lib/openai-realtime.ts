import "server-only";

// OpenAI Realtime, used for the browser voice demo.
//
// The shape of this is different from ElevenLabs on purpose: there is no agent
// object on OpenAI's side. Every session carries its own instructions, voice,
// and turn-detection config, sent from here when the ephemeral credential is
// minted. That is why VoiceAgent.instructions exists.

const CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets";

export const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL?.trim() || "gpt-realtime-2.1";

// "marin" is the documented default. Anything the account supports can be set
// per-agent via VoiceAgent.voice.
export const DEFAULT_VOICE = "marin";

export class OpenAIConfigurationError extends Error {}
export class OpenAIUpstreamError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function getApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new OpenAIConfigurationError("OPENAI_API_KEY is not set.");
  return key;
}

/**
 * Mints a short-lived credential the browser can open a WebRTC session with.
 * The real API key never leaves the server, and the returned secret is scoped
 * to one session with the config baked in — a caller can't re-point it at a
 * different model or a longer prompt.
 */
export async function createRealtimeClientSecret(opts: {
  instructions: string;
  voice?: string | null;
  /** Stable, privacy-preserving id so abuse maps to one caller, not the org. */
  safetyIdentifier?: string;
}) {
  const apiKey = getApiKey();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(CLIENT_SECRETS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Ties enforcement to the individual demo caller rather than the whole
        // ArkiTech account if someone abuses a public demo link.
        ...(opts.safetyIdentifier ? { "OpenAI-Safety-Identifier": opts.safetyIdentifier } : {}),
      },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: REALTIME_MODEL,
          instructions: opts.instructions,
          audio: {
            input: {
              // Semantic turn detection reads intent rather than raw silence,
              // so the agent stops talking over people who pause mid-sentence.
              turn_detection: { type: "semantic_vad", interrupt_response: true },
              // Drives the caller-side lines in the on-screen transcript. If the
              // account can't serve this the session still runs; the transcript
              // just shows the agent's side only.
              transcription: { model: "gpt-live-transcribe" },
            },
            output: { voice: opts.voice?.trim() || DEFAULT_VOICE },
          },
          // Low is the documented production default. Higher settings add
          // think-time, and dead air is what makes a voice agent feel fake.
          reasoning: { effort: "low" },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new OpenAIUpstreamError(
        `OpenAI returned HTTP ${response.status}. ${detail.slice(0, 200)}`,
        response.status,
      );
    }

    const payload: unknown = await response.json();
    const secret = extractClientSecret(payload);
    if (!secret) throw new OpenAIUpstreamError("OpenAI returned no client secret.", 502);

    return { clientSecret: secret, model: REALTIME_MODEL };
  } catch (error) {
    if (error instanceof OpenAIUpstreamError || error instanceof OpenAIConfigurationError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new OpenAIUpstreamError("OpenAI timed out.", 504);
    }
    throw new OpenAIUpstreamError("OpenAI could not be reached.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

// The GA response nests the secret under `value`; older shapes returned it flat.
// Read defensively rather than pinning to one shape.
function extractClientSecret(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const record = payload as Record<string, unknown>;

  if (typeof record.value === "string") return record.value;

  const nested = record.client_secret;
  if (typeof nested === "string") return nested;
  if (typeof nested === "object" && nested !== null) {
    const value = (nested as Record<string, unknown>).value;
    if (typeof value === "string") return value;
  }

  return null;
}
