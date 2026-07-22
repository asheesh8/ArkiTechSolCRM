import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isManager } from "@/lib/auth";
import { noteCreateSchema } from "@/lib/schemas";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Please sign in before adding notes." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const payload = noteCreateSchema.parse(await request.json());
    const lead = await prisma.lead.findUnique({ where: { id }, select: { assignedToId: true } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    if (!isManager(currentUser) && lead.assignedToId !== currentUser.id) {
      return NextResponse.json({ error: "This lead isn't assigned to you." }, { status: 403 });
    }

    const status =
      payload.callOutcome === "MEETING_BOOKED"
        ? "MEETING_BOOKED"
        : payload.callOutcome === "FOLLOW_UP"
          ? "FOLLOW_UP"
          : payload.callOutcome === "CLOSED"
            ? "CLOSED"
            : payload.callOutcome === "NOT_INTERESTED"
              ? "NOT_INTERESTED"
              : "CALLED";
    const [note] = await prisma.$transaction([
      prisma.callNote.create({
        data: {
          leadId: id,
          userId: currentUser.id,
          note: payload.note,
          noteType: payload.noteType,
          callOutcome: payload.callOutcome,
          followUpDate: payload.followUpDate ? new Date(payload.followUpDate) : null,
        },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.lead.update({
        where: { id },
        data: { status },
      }),
    ]);

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to add note" }, { status: 400 });
  }
}
