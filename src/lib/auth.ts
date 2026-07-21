import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("locallead_user")?.value;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  return null;
}

// Managers (currently OWNER role) see and assign every lead/client.
// Everyone else is an agent who only sees leads delegated to them.
export function isManager(user: { role?: string | null } | null | undefined) {
  return user?.role === "OWNER";
}
