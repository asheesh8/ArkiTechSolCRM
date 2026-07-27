import { requireRoles } from "@/lib/route-guard";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRoles(["OWNER", "MEMBER"]);
  return <>{children}</>;
}
