import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionForClient, setPortalCookie } from "@/lib/portal-auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const client = await prisma.client.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Account exists but password not set yet — still in setup
  if (client && !client.passwordHash) {
    return NextResponse.json({ error: "Your account isn't set up yet. Check your email for the setup link." }, { status: 401 });
  }

  if (!client || !(await bcrypt.compare(password, client.passwordHash!))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const sessionToken = await createSessionForClient(client.id);
  await setPortalCookie(sessionToken);

  return NextResponse.json({ ok: true });
}
