import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { createSetupToken } from "@/lib/portal-auth";
import { sendPortalWelcome } from "@/lib/email";

// Re-sends the portal setup link. Signing a contract normally triggers this, so
// this is the manual path for onboardings that never got that far.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(session)) {
    return NextResponse.json({ error: "Only an owner can send a portal invite" }, { status: 403 });
  }

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const setupToken = await createSetupToken(client.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const setupUrl = `${baseUrl}/portal/setup?token=${setupToken}`;

  try {
    await sendPortalWelcome({
      to: client.email,
      name: client.name,
      businessName: client.businessName,
      setupUrl,
    });
  } catch (e) {
    // The token is live either way — hand back the link so it can be shared manually.
    return NextResponse.json(
      { error: `Invite link created, but the email failed to send: ${e instanceof Error ? e.message : "unknown error"}`, setupUrl },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, setupUrl });
}

// Wipes a client's portal credentials without touching their contracts or work.
// The client keeps existing, but has to be re-invited before they can log in —
// the fix for a half-finished or broken portal setup.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(session)) {
    return NextResponse.json({ error: "Only an owner can reset a portal login" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.client.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.client.update({
    where: { id },
    data: {
      passwordHash: null,
      sessionToken: null,
      sessionExpiry: null,
      setupToken: null,
      setupExpiry: null,
    },
  });

  return NextResponse.json({ ok: true, portalStatus: "NONE" });
}
