import { redirect } from "next/navigation";
import { AppShell } from "@/components/crm/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const coldCallAllowed = await canAccessColdCall(user.id, user.role);

  return (
    <AppShell
      user={{ name: user.name, email: user.email, role: user.role }}
      canAccessColdCall={coldCallAllowed}
    >
      {children}
    </AppShell>
  );
}
