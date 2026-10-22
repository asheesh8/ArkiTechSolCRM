import { redirect } from "next/navigation";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeCustomizer } from "@/components/crm/theme-customizer";
import { TeamManager } from "@/components/crm/team-manager";
import { PricingManager } from "@/components/crm/pricing-manager";
import { PasswordChangeForm } from "@/components/crm/password-change-form";

export const metadata = { title: "Settings · LocalLead CRM" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const owner = isOwner(user);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-zinc-500">Manage your account security and workspace preferences.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Account security</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            Change the password you use to sign in as {user.email}.
          </p>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      {owner ? (
        <>
          <TeamManager currentUserId={user.id} />

          <Card>
            <CardHeader>
              <CardTitle>Public pricing</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                What visitors see on arkitech-sol.com/pricing. Saving here updates the site immediately —
                no deploy needed.
              </p>
            </CardHeader>
            <CardContent>
              <PricingManager />
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent>
          <ThemeCustomizer />
        </CardContent>
      </Card>
    </div>
  );
}
