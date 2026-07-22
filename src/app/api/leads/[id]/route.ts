import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoLeads, demoNotes } from "@/lib/demo-data";
import { getCurrentUser, isManager } from "@/lib/auth";
import { leadUpdateSchema } from "@/lib/schemas";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        callNotes: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } },
        audits: { orderBy: { createdAt: "desc" } },
        client: {
          include: {
            contracts: { orderBy: { createdAt: "desc" } },
            invoices: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    // Agents can only open leads delegated to them.
    if (!isManager(user) && lead.assignedToId !== user.id) {
      return NextResponse.json({ error: "This lead isn't assigned to you." }, { status: 403 });
    }
    return NextResponse.json({ lead });
  } catch {
    const lead = demoLeads.find((item) => item.id === id) ?? demoLeads[0];
    return NextResponse.json({ lead: { ...lead, callNotes: demoNotes, audits: [] }, demo: true });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const payload = leadUpdateSchema.parse(await request.json());

    if (!isManager(user)) {
      // Agents may only touch their own leads, and may never reassign.
      const existing = await prisma.lead.findUnique({ where: { id }, select: { assignedToId: true } });
      if (!existing || existing.assignedToId !== user.id) {
        return NextResponse.json({ error: "This lead isn't assigned to you." }, { status: 403 });
      }
      delete (payload as Record<string, unknown>).assignedToId;
    }

    const lead = await prisma.lead.update({ where: { id }, data: payload });
    return NextResponse.json({ lead });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update lead" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    if (!isManager(user)) {
      const existing = await prisma.lead.findUnique({ where: { id }, select: { assignedToId: true } });
      if (!existing || existing.assignedToId !== user.id) {
        return NextResponse.json({ error: "This lead isn't assigned to you." }, { status: 403 });
      }
    }

    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete lead" }, { status: 400 });
  }
}
