import { redirect } from "next/navigation";
import { ColdCallWorkspace } from "@/components/crm/cold-call-workspace";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { secretBoxReady } from "@/lib/secret-box";
import { twilioConnectionForUser } from "@/lib/twilio-credentials";
import { recordingEnabled } from "@/lib/twilio-voice";

export const metadata = { title: "Cold Call · LocalLead CRM" };

export default async function ColdCallPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allowed = await canAccessColdCall(user.id, user.role);
  if (!allowed) redirect("/dashboard");

  // Their own connected account, or the shared company line if they haven't
  // connected one. `usable` is the honest answer to "will the Call button work".
  const connection = await twilioConnectionForUser(user.id);

  return (
    <ColdCallWorkspace
      callerName={user.name.split(/\s+/)[0] || user.name}
      canManageAccess={isOwner(user)}
      recordingEnabled={recordingEnabled()}
      connection={{ ...connection, canStore: secretBoxReady() }}
    />
  );
}
