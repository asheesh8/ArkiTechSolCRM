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
    where: { magicToken: token, magicExpiry: { gt: new Date() } },
  });
  return client ?? null;
}

export async function createMagicToken(clientId: string) {
  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await prisma.client.update({
    where: { id: clientId },
    data: { magicToken: token, magicExpiry: expiry },
  });
  return token;
}

export async function createSessionToken(clientId: string) {
  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.client.update({
    where: { id: clientId },
    data: { magicToken: token, magicExpiry: expiry },
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
