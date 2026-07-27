import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Server-side page guard mirroring the sidebar's per-route role allowlist, so a
// route is actually protected and not just hidden from the nav. Non-signed-in
// users go to login; wrong-role users (e.g. a developer opening a sales page)
// are sent back to their dashboard.
export async function requireRoles(roles: string[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}
