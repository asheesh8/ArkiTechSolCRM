import { redirect } from "next/navigation";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeCustomizer } from "@/components/crm/theme-customizer";
import { TeamManager } from "@/components/crm/team-manager";

export const metadata = { title: "Team · LocalLead CRM" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isOwner(user)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Team &amp; settings</h2>
        <p className="mt-1 text-sm text-zinc-500">Add teammates, set what each role can access, and manage logins.</p>
      </section>

      <TeamManager currentUserId={user.id} />

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent>
          <ThemeCustomizer />
        </CardContent>
      </Card>
    </div>
  );
}
