import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const normalized = email.toLowerCase().trim();

  const crmUser = await prisma.user.findUnique({ where: { email: normalized } });
  if (crmUser) return NextResponse.json({ type: "staff" });

  const client = await prisma.client.findUnique({ where: { email: normalized } });
  if (client) return NextResponse.json({ type: "client" });

  return NextResponse.json({ type: "unknown" });
}
