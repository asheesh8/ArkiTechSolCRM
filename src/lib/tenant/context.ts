import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/types";
import type { ModuleKey } from "@/modules/registry";

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
export type WorkspaceModule = Database["public"]["Tables"]["workspace_modules"]["Row"];

export type WorkspaceTheme = {
  accent?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  wordmark?: string;
  poweredBy?: boolean;
  radius?: "sharp" | "soft" | "round";
  artwork?: string;
};

export type TenantContext = {
  workspace: Workspace;
  theme: WorkspaceTheme;
  /** null for staff who are not members. */
  membership: Membership | null;
  isStaff: boolean;
  user: { id: string; email: string; name: string; avatarUrl: string | null };
  /** Module keys the workspace has (included, active or trial). */
  modules: Set<ModuleKey>;
  moduleRows: WorkspaceModule[];
  role: "staff" | "owner" | "admin" | "member";
  canWrite: (module: string) => boolean;
  has: (module: ModuleKey) => boolean;
};

/**
 * Loads the signed-in user, the workspace behind the slug, and what the user
 * may do there. Cached per request. Redirects to sign-in when there is no
 * user, 404s when the workspace isn't one of theirs (the RLS select returns
 * nothing, so we never confirm a slug exists to an outsider).
 */
export const getTenant = cache(async (slug: string): Promise<TenantContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/w/${slug}`);

  const [{ data: workspace }, { data: staff }] = await Promise.all([
    supabase.from("workspaces").select("*").eq("slug", slug).maybeSingle(),
    supabase.from("staff").select("role").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!workspace) notFound();

  const [{ data: membership }, { data: moduleRows }, { data: profile }] = await Promise.all([
    supabase.from("memberships").select("*").eq("workspace_id", workspace.id).eq("user_id", user.id).maybeSingle(),
    supabase.from("workspace_modules").select("*").eq("workspace_id", workspace.id),
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
  ]);

  const isStaff = Boolean(staff);
  if (!isStaff && !membership) notFound();

  const active = new Set<ModuleKey>(
    (moduleRows ?? [])
      .filter((m) => m.status === "included" || m.status === "active" || m.status === "trial")
      .map((m) => m.module_key as ModuleKey),
  );
  const role = isStaff ? "staff" : (membership!.role as "owner" | "admin" | "member");
  const perms = (membership?.permissions ?? {}) as Record<string, string>;

  return {
    workspace,
    theme: (workspace.theme ?? {}) as WorkspaceTheme,
    membership: membership ?? null,
    isStaff,
    user: {
      id: user.id,
      email: user.email ?? "",
      name: profile?.full_name ?? user.email?.split("@")[0] ?? "You",
      avatarUrl: profile?.avatar_url ?? null,
    },
    modules: active,
    moduleRows: moduleRows ?? [],
    role,
    canWrite: (module) => role === "staff" || role === "owner" || role === "admin" || (perms[module] ?? "read") === "write",
    has: (module) => isStaff || active.has(module),
  };
});

/**
 * Guard for a module page or action: the workspace must have the module and
 * the user must be allowed in. Staff pass. Returns the tenant for convenience.
 */
export async function requireModule(slug: string, module: ModuleKey, opts: { write?: boolean } = {}) {
  const tenant = await getTenant(slug);
  if (!tenant.has(module)) redirect(`/w/${slug}/billing?add=${module}`);
  if (opts.write && !tenant.canWrite(module)) throw new Error("You can view this, but not change it.");
  return tenant;
}

/** The current user, or a redirect to sign in. For pages outside a workspace. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getStaff = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;
  const { data } = await supabase.from("staff").select("*").eq("user_id", user.id).maybeSingle();
  return data;
});
