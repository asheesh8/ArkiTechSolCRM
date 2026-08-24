import { redirect } from "next/navigation";
import { getCurrentUser, canBuildDemos } from "@/lib/auth";
import { DemoWorkspace } from "@/components/crm/demo-workspace";

export const metadata = { title: "Demo Builds · LocalLead CRM" };

// The developers' room. Access is the DEV role, which owners hand out in team
// settings — so "who can see this" needs no separate mechanism.
export default async function DemosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canBuildDemos(user)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Demo builds</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Build against a brief, attach the codebase and a live link, and submit it. Approved builds get a
          repository and a deploy without anyone unzipping anything by hand.
        </p>
      </section>

      <DemoWorkspace viewerRole={user.role} viewerId={user.id} />
    </div>
  );
}
