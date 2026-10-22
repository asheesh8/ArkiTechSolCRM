import "server-only";

/**
 * Sends a website lead to the ArkiTech Command Center CRM through its
 * leads-api edge function. The key is an `ak_` key with the leads:write
 * scope, made by an owner under Team → API keys in the Command Center, and
 * set here as COMMAND_CENTER_API_KEY. It never reaches the browser.
 *
 * The Command Center skips a lead it already has (same phone, website, or
 * name and town). When that happens the new request is added to that lead as
 * a note, so a returning visitor's answers aren't lost.
 */

const DEFAULT_URL = "https://bnmntlqjoiqrskjkfzsv.supabase.co/functions/v1/leads-api";

export type CommandCenterLead = {
  company: string;
  contact: string;
  email: string;
  phone?: string;
  service: string;
  priority: "Priority" | "Standard";
  notes: string;
};

export type CommandCenterResult = { status: "created" | "updated"; id: string } | { status: "skipped" };

export async function sendToCommandCenter(lead: CommandCenterLead): Promise<CommandCenterResult> {
  const key = process.env.COMMAND_CENTER_API_KEY?.trim();
  if (!key) {
    console.warn("[Command Center] COMMAND_CENTER_API_KEY is not set, so this lead was not sent there.");
    return { status: "skipped" };
  }
  const base = (process.env.COMMAND_CENTER_API_URL?.trim() || DEFAULT_URL).replace(/\/+$/, "");
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  const res = await fetch(`${base}/leads`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...lead, stage: "new", source: "Website (arkitech-sol.com)" }),
    signal: AbortSignal.timeout(8000),
  });
  const body = (await res.json().catch(() => null)) as {
    error?: string;
    results?: { status: string; id?: string; error?: string }[];
  } | null;
  if (!res.ok) throw new Error(`leads-api ${res.status}: ${body?.error ?? "no detail"}`);

  const result = body?.results?.[0];
  if (result?.status === "created" && result.id) return { status: "created", id: result.id };
  if (result?.status === "duplicate" && result.id) {
    const patch = await fetch(`${base}/leads/${encodeURIComponent(result.id)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ note: lead.notes, ...(lead.priority === "Priority" ? { priority: "Priority" } : {}) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!patch.ok) throw new Error(`leads-api PATCH ${patch.status}`);
    return { status: "updated", id: result.id };
  }
  throw new Error(`leads-api: ${result?.error ?? "unexpected response"}`);
}
