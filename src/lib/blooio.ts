import "server-only";

// Blooio: one API for iMessage, RCS and SMS, picking the best channel the
// recipient's device supports and dropping to SMS when it must.
//
// It sits in front of Twilio rather than replacing it. A blue-bubble thread
// reads as a person rather than a broadcast, which is the whole point for
// outreach — but it is one vendor between us and the message, so every send
// that fails here is retried on Twilio rather than lost.

const DEFAULT_BASE = "https://api.blooio.com/v2/api";

export type BlooioMessage = {
  id: string;
  text: string;
  outbound: boolean;
  at: string | null;
  status: string | null;
  /** "imessage", "rcs" or "sms" — which channel it actually went over. */
  protocol: string | null;
};

export function blooioConfigured() {
  return Boolean(process.env.BLOOIO_API_KEY?.trim());
}

function config() {
  const apiKey = process.env.BLOOIO_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    base: (process.env.BLOOIO_API_BASE?.trim() || DEFAULT_BASE).replace(/\/+$/, ""),
    // Only needed on accounts holding more than one number; otherwise Blooio
    // picks at the account level.
    fromNumber: process.env.BLOOIO_FROM_NUMBER?.trim() || null,
  };
}

/**
 * Chat ids are the phone number itself, and the `+` has to survive the URL.
 * Left unencoded it decodes as a space and the number silently breaks.
 */
function chatPath(e164: string) {
  return encodeURIComponent(e164);
}

export class BlooioError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BlooioError";
    this.status = status;
  }
}

async function call(path: string, init: RequestInit = {}) {
  const settings = config();
  if (!settings) throw new BlooioError("Blooio isn't configured.", 503);

  const response = await fetch(`${settings.base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    // Blooio's error bodies are not documented as a fixed shape, so take
    // whatever readable message is there and fall back to the status.
    const body = await response.text().catch(() => "");
    let detail = "";
    try {
      const parsed = JSON.parse(body) as { error?: string; message?: string; detail?: string };
      detail = parsed.error || parsed.message || parsed.detail || "";
    } catch {
      detail = body.slice(0, 200);
    }
    throw new BlooioError(detail || `Blooio returned ${response.status}.`, response.status);
  }

  return response;
}

/** Queue one message. A 202 means accepted, not delivered. */
export async function sendBlooioMessage(to: string, text: string) {
  const settings = config();
  const response = await call(`/chats/${chatPath(to)}/messages`, {
    method: "POST",
    body: JSON.stringify({
      text,
      ...(settings?.fromNumber ? { from_number: settings.fromNumber } : {}),
    }),
  });

  const data = (await response.json().catch(() => ({}))) as { message_id?: string; status?: string };
  return { id: data.message_id ?? null, status: data.status ?? "queued" };
}

type BlooioApiMessage = {
  message_id?: string;
  direction?: string;
  text?: string;
  sender?: string;
  // Epoch milliseconds, as a number — not an ISO string like most of the rest
  // of this codebase deals in.
  time_sent?: number;
  time_delivered?: number;
  status?: string;
  protocol?: string;
};

/** Read a conversation back, oldest first, the way a thread is read. */
export async function listBlooioMessages(withNumber: string): Promise<BlooioMessage[]> {
  const response = await call(`/chats/${chatPath(withNumber)}/messages`, { method: "GET" });
  const data = (await response.json().catch(() => ({}))) as { messages?: BlooioApiMessage[] };

  const rows = Array.isArray(data.messages) ? data.messages : [];

  return rows
    .map((item) => {
      const sentAt = typeof item.time_sent === "number" ? new Date(item.time_sent) : null;
      return {
        id: item.message_id ?? crypto.randomUUID(),
        text: item.text ?? "",
        outbound: item.direction === "outbound",
        at: sentAt && !Number.isNaN(sentAt.getTime()) ? sentAt.toISOString() : null,
        status: item.status ?? null,
        protocol: item.protocol ?? null,
      };
    })
    .sort((a, b) => (a.at ?? "").localeCompare(b.at ?? ""));
}
