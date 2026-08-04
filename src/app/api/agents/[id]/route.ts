import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { uniqueSlug } from "@/lib/voice-agents";

async function requireOwner() {
  const user = await getCurrentUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isOwner(user)) {
    return { response: NextResponse.json({ error: "Owner access is required." }, { status: 403 }) };
  }
  return { user };
}

const patchSchema = z.object({
  clientId: z.string().trim().nullable().optional(),
  demoEnabled: z.boolean().optional(),
  demoHeadline: z.string().trim().max(120).nullable().optional(),
  demoSubheadline: z.string().trim().max(400).nullable().optional(),
  demoBusiness: z.string().trim().max(80).nullable().optional(),
  slug: z.string().trim().min(1).max(60).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireOwner();
  if ("response" in access) return access.response;

  const { id } = await params;
  const existing = await prisma.voiceAgent.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Those agent settings aren't valid." }, { status: 400 });
  }
  const body = parsed.data;

  if (body.clientId) {
    const client = await prisma.client.findUnique({ where: { id: body.clientId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "That client no longer exists." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.clientId !== undefined) data.clientId = body.clientId || null;
  if (body.demoHeadline !== undefined) data.demoHeadline = body.demoHeadline || null;
  if (body.demoSubheadline !== undefined) data.demoSubheadline = body.demoSubheadline || null;
  if (body.demoBusiness !== undefined) data.demoBusiness = body.demoBusiness || null;
  if (body.slug !== undefined) data.slug = await uniqueSlug(body.slug, id);

  if (body.demoEnabled !== undefined) {
    if (body.demoEnabled && existing.isArchived) {
      return NextResponse.json(
        { error: "This agent no longer exists on ElevenLabs, so its demo can't be published." },
        { status: 409 },
      );
    }
    data.demoEnabled = body.demoEnabled;
  }

  const agent = await prisma.voiceAgent.update({
    where: { id },
    data,
    include: { client: { select: { id: true, businessName: true } } },
  });

  return NextResponse.json({ agent });
}

// Drops the CRM-side record only. The agent itself stays on ElevenLabs, and a
// re-sync brings it back — this is for clearing rows, not deleting agents.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireOwner();
  if ("response" in access) return access.response;

  const { id } = await params;
  const existing = await prisma.voiceAgent.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.voiceAgent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
