import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canBuildDemos } from "@/lib/auth";
import { demoCreateSchema } from "@/lib/schemas";
import { getBrief } from "@/lib/demo-briefs";
import { serializeDemo } from "@/lib/demos";

// The developers' demo queue. A developer sees their own builds; an owner sees
// everyone's, because reviewing them is the owner's job.

const DEV_SELECT = { id: true, name: true, email: true } as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canBuildDemos(user)) {
    return NextResponse.json({ error: "Demo builds are for developers and owners." }, { status: 403 });
  }

  try {
    const demos = await prisma.demoSubmission.findMany({
      where: user.role === "OWNER" ? {} : { developerId: user.id },
      orderBy: [{ updatedAt: "desc" }],
      include: { developer: { select: DEV_SELECT } },
    });
    return NextResponse.json({
      demos: demos.map(serializeDemo),
      viewerRole: user.role,
      viewerId: user.id,
    });
  } catch (err) {
    console.error("[demos] list failed", err);
    return NextResponse.json({ error: "Couldn't load demo builds." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canBuildDemos(user)) {
    return NextResponse.json({ error: "Demo builds are for developers and owners." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = demoCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "That didn't validate." },
      { status: 400 },
    );
  }
  if (!getBrief(parsed.data.businessType)) {
    return NextResponse.json({ error: "Pick a business type from the list." }, { status: 400 });
  }

  try {
    const demo = await prisma.demoSubmission.create({
      data: { ...parsed.data, developerId: user.id },
      include: { developer: { select: DEV_SELECT } },
    });
    return NextResponse.json({ demo: serializeDemo(demo) }, { status: 201 });
  } catch (err) {
    console.error("[demos] create failed", err);
    return NextResponse.json({ error: "Couldn't start that demo build." }, { status: 500 });
  }
}
