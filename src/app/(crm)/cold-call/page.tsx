import { redirect } from "next/navigation";
import { ColdCallWorkspace } from "@/components/crm/cold-call-workspace";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { twilioVoiceConfigured } from "@/lib/twilio-voice";

export const metadata = { title: "Cold Call · LocalLead CRM" };

export default async function ColdCallPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) redirect("/dashboard");

  return (
    <ColdCallWorkspace
      callerName={user.name.split(/\s+/)[0] || user.name}
      canManageAccess={isOwner(user)}
      dialerEnabled={twilioVoiceConfigured()}
    />
  );
}
