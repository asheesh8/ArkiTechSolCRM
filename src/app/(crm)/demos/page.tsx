import { redirect } from "next/navigation";
import { getCurrentUser, canBuildDemos } from "@/lib/auth";
import { DemoWorkspace } from "@/components/crm/demo-workspace";

export const metadata = { title: "Build Studio · LocalLead CRM" };

// The developers' room. Access is the DEV role, which owners hand out in team
// settings — so "who can see this" needs no separate mechanism.
export default async function DemosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canBuildDemos(user)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <section>
        <h2 className="studio-display text-2xl font-semibold">Build studio</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Prepare the project from a real business source, work from proven references, then attach the
          codebase and live preview for review and delivery.
        </p>
      </section>

      <DemoWorkspace viewerRole={user.role} viewerId={user.id} />
    </div>
  );
}
