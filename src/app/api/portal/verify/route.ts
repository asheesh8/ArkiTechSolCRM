import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setPortalCookie } from "@/lib/portal-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/portal/login?error=invalid", req.url));

  const client = await prisma.client.findFirst({
    where: { magicToken: token, magicExpiry: { gt: new Date() } },
  });
  if (!client) return NextResponse.redirect(new URL("/portal/login?error=expired", req.url));

  const sessionToken = await createSessionToken(client.id);
  await setPortalCookie(sessionToken);

  return NextResponse.redirect(new URL("/portal", req.url));
}
