import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionForClient, setPortalCookie } from "@/lib/portal-auth";

// Legacy verify endpoint — redirects outstanding old-style links to setup
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/portal/login?error=invalid", req.url));

  const client = await prisma.client.findFirst({
    where: { setupToken: token, setupExpiry: { gt: new Date() } },
  });
  if (!client) return NextResponse.redirect(new URL("/portal/login?error=expired", req.url));

  const sessionToken = await createSessionForClient(client.id);
  await setPortalCookie(sessionToken);
  return NextResponse.redirect(new URL("/portal", req.url));
}
