import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import PortalShell from "@/components/portal/portal-shell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const client = await getPortalSession();
  if (!client) redirect("/portal/login");
  return <PortalShell client={{ name: client.name, businessName: client.businessName, email: client.email }}>{children}</PortalShell>;
}
