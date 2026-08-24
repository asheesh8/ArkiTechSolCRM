import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { demoReviewSchema } from "@/lib/schemas";
import { serializeDemo } from "@/lib/demos";

const DEV_SELECT = { id: true, name: true, email: true } as const;

// Approve a build or send it back. Owner-only: this is the judgement the whole
// pipeline exists to protect, so it is not delegated to the DEV role.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isOwner(user)) {
    return NextResponse.json({ error: "Only an owner can review demo builds." }, { status: 403 });
  }

  const { id } = await params;
  const demo = await prisma.demoSubmission.findUnique({ where: { id } });
  if (!demo) return NextResponse.json({ error: "That demo build doesn't exist." }, { status: 404 });
  if (demo.status !== "SUBMITTED") {
    return NextResponse.json(
      { error: "Only a build that is in review can be approved or sent back." },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = demoReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "That didn't validate." },
      { status: 400 },
    );
  }

  const { action, ownerNote } = parsed.data;
  if (action === "request-changes" && !ownerNote?.trim()) {
    // Sending work back without saying why wastes a round trip and teaches the
    // developer nothing, which defeats the point of the whole exercise.
    return NextResponse.json({ error: "Say what needs changing before sending it back." }, { status: 400 });
  }

  try {
    const updated = await prisma.demoSubmission.update({
      where: { id },
      data: {
        status: action === "approve" ? "APPROVED" : "CHANGES_REQUESTED",
        ownerNote: ownerNote?.trim() || null,
      },
      include: { developer: { select: DEV_SELECT } },
    });
    return NextResponse.json({ demo: serializeDemo(updated) });
  } catch (err) {
    console.error("[demos] review failed", err);
    return NextResponse.json({ error: "Couldn't record that decision." }, { status: 500 });
  }
}
