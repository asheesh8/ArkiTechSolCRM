import { redirect } from "next/navigation";
import { ColdCallWorkspace } from "@/components/crm/cold-call-workspace";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { secretBoxReady } from "@/lib/secret-box";
import { twilioConnectionForUser } from "@/lib/twilio-credentials";
import { recordingEnabled } from "@/lib/twilio-voice";

export const metadata = { title: "Cold Outreach · LocalLead CRM" };

// Texting and calling share this room, but not their access rules: the dialer
// is gated by the cold-call share list, while texting has always been open to
// owners and members. Neither is widened here — a teammate who could only text
// still only texts, they just do it in a different place.
const TEXT_ROLES = ["OWNER", "MEMBER"];

export default async function ColdCallPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const canCall = await canAccessColdCall(user.id, user.role);
  const canText = TEXT_ROLES.includes(user.role);
  if (!canCall && !canText) redirect("/dashboard");

  // Their own connected account, or the shared company line if they haven't
  // connected one. `usable` is the honest answer to "will the Call button work".
  const connection = await twilioConnectionForUser(user.id);

  // /outreach lands here with ?mode=text. Anyone who can't dial starts on the
  // only tab they have.
  const requested = (await searchParams).mode;
  const initialMode = !canCall || requested === "text" ? "text" : "call";

  return (
    <ColdCallWorkspace
      callerName={user.name.split(/\s+/)[0] || user.name}
      canManageAccess={isOwner(user)}
      canCall={canCall}
      canText={canText}
      initialMode={initialMode}
      recordingEnabled={recordingEnabled()}
      connection={{ ...connection, canStore: secretBoxReady() }}
    />
  );
}
