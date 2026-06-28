import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const COOKIE = "portal_session";
const SESSION_DAYS = 30;

export async function getPortalSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const client = await prisma.client.findFirst({
    where: { sessionToken: token, sessionExpiry: { gt: new Date() } },
  });
  return client ?? null;
}

export async function createSessionForClient(clientId: string) {
  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.client.update({
    where: { id: clientId },
    data: { sessionToken: token, sessionExpiry: expiry },
  });
  return token;
}

export async function setPortalCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearPortalCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function createSetupToken(clientId: string) {
  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  await prisma.client.update({
    where: { id: clientId },
    data: { setupToken: token, setupExpiry: expiry },
  });
  return token;
}
