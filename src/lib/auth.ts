import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const STAFF_SESSION_COOKIE = "locallead_user";
export const STAFF_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createStaffSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + STAFF_SESSION_MAX_AGE_SECONDS * 1_000);

  await prisma.$transaction([
    prisma.staffSession.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
    prisma.staffSession.create({
      data: { userId, tokenHash: hashSessionToken(token), expiresAt },
    }),
  ]);

  return { token, expiresAt };
}

export async function revokeStaffSession(token: string | null | undefined) {
  if (!token) return;
  await prisma.staffSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.staffSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.staffSession.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

// Managers (currently OWNER role) see and assign every lead/client.
// Everyone else is an agent who only sees leads delegated to them.
export function isManager(user: { role?: string | null } | null | undefined) {
  return user?.role === "OWNER";
}
