import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionForClient, setPortalCookie } from "@/lib/portal-auth";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const client = await prisma.client.findFirst({
    where: { setupToken: token, setupExpiry: { gt: new Date() } },
    select: { id: true, name: true, email: true, businessName: true },
  });
  if (!client) return NextResponse.json({ error: "This link has expired or is invalid." }, { status: 404 });
  return NextResponse.json({ client });
}

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const client = await prisma.client.findFirst({
    where: { setupToken: token, setupExpiry: { gt: new Date() } },
  });
  if (!client) return NextResponse.json({ error: "This link has expired. Please contact ArkiTech for a new one." }, { status: 404 });

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.client.update({
    where: { id: client.id },
    data: { passwordHash, setupToken: null, setupExpiry: null },
  });

  // Log them straight in
  const sessionToken = await createSessionForClient(client.id);
  await setPortalCookie(sessionToken);

  return NextResponse.json({ ok: true });
}
