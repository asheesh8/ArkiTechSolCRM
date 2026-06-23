import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { noteCreateSchema } from "@/lib/schemas";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const payload = noteCreateSchema.parse(await request.json());
    const currentUser = payload.userId
      ? await prisma.user.findUnique({ where: { id: payload.userId } })
      : await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Please sign in before adding notes." }, { status: 401 });
    }

    const note = await prisma.callNote.create({
      data: {
        leadId: id,
        userId: currentUser.id,
        note: payload.note,
        callOutcome: payload.callOutcome,
        followUpDate: payload.followUpDate ? new Date(payload.followUpDate) : null,
      },
      include: { user: { select: { name: true, email: true } } },
    });

    await prisma.lead.update({
      where: { id },
      data: {
        status:
          payload.callOutcome === "MEETING_BOOKED"
            ? "MEETING_BOOKED"
            : payload.callOutcome === "FOLLOW_UP"
              ? "FOLLOW_UP"
              : payload.callOutcome === "CLOSED"
                ? "CLOSED"
                : payload.callOutcome === "NOT_INTERESTED"
                  ? "NOT_INTERESTED"
                  : "CALLED",
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to add note" }, { status: 400 });
  }
}
