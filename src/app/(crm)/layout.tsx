import { redirect } from "next/navigation";
import { AppShell } from "@/components/crm/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AppShell>
  );
}
