import "server-only";
import { z, type ZodType } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Shape every server action returns, so forms can show one error line and
 * callers never need try/catch.
 */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}
export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** Parse FormData or a plain object with a Zod schema into an ActionResult. */
export function parseInput<S extends ZodType>(schema: S, input: FormData | unknown): ActionResult<z.infer<S>> {
  const raw = input instanceof FormData ? Object.fromEntries(input.entries()) : input;
  const r = schema.safeParse(raw);
  if (r.success) return ok(r.data);
  const fieldErrors: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const k = issue.path.join(".") || "_";
    if (!fieldErrors[k]) fieldErrors[k] = issue.message;
  }
  return fail("Please check the highlighted fields.", fieldErrors);
}

/**
 * Idempotent write: a client that retries with the same key gets the first
 * response back instead of a second row. Keys are scoped by workspace.
 */
export async function withIdempotency<T>(key: string | null | undefined, workspaceId: string, run: () => Promise<T>): Promise<T> {
  if (!key) return run();
  const supabase = await createClient();
  const full = `${workspaceId}:${key}`;
  const { data: existing } = await supabase.from("idempotency_keys").select("response").eq("key", full).maybeSingle();
  if (existing) return existing.response as T;
  const result = await run();
  await supabase.from("idempotency_keys").insert({ key: full, workspace_id: workspaceId, response: result as never });
  return result;
}

export async function audit(workspaceId: string, action: string, entity?: string, entityId?: string, meta: Record<string, unknown> = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({ workspace_id: workspaceId, actor_id: user?.id ?? null, action, entity, entity_id: entityId, meta: meta as never });
}
