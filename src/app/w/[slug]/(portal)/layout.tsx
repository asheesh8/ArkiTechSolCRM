import { redirect } from "next/navigation";
import { getTenant } from "@/lib/tenant/context";
import { createClient } from "@/lib/supabase/server";
import { themeCss } from "@/lib/theme/accent";
import { Shell } from "@/components/shell/shell";

export default async function WorkspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getTenant(slug);

  if (!tenant.workspace.onboarding_completed_at && !tenant.isStaff) redirect(`/w/${slug}/onboarding`);

  const supabase = await createClient();
  const [{ count: unread }, { data: mine }] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("workspace_id", tenant.workspace.id).is("read_at", null),
    supabase.from("workspaces").select("slug, name").neq("id", tenant.workspace.id).order("name").limit(20),
  ]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCss(tenant.theme.accent, tenant.theme.radius) }} />
      <Shell
        slug={slug}
        workspace={{ name: tenant.workspace.name, logoUrl: tenant.theme.logoUrl, poweredBy: tenant.theme.poweredBy !== false }}
        user={tenant.user}
        modules={[...tenant.modules]}
        role={tenant.role}
        unread={unread ?? 0}
        switcher={tenant.isStaff ? [] : (mine ?? [])}
        isStaff={tenant.isStaff}
      >
        {children}
      </Shell>
    </>
  );
}
