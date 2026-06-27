import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMagicLink } from "@/lib/email";
import { createMagicToken } from "@/lib/portal-auth";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const client = await prisma.client.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Always return 200 to avoid user enumeration
  if (!client) return NextResponse.json({ ok: true });

  const token = await createMagicToken(client.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${baseUrl}/api/portal/verify?token=${token}`;

  await sendMagicLink(client.email, client.name, link);
  return NextResponse.json({ ok: true });
}
