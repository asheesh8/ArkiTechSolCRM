import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canBuildDemos } from "@/lib/auth";
import { demoUpdateSchema, demoAttachSchema } from "@/lib/schemas";
import { getBrief } from "@/lib/demo-briefs";
import { canView, canEdit, serializeDemo } from "@/lib/demos";
import { deleteFile } from "@/lib/r2";

const DEV_SELECT = { id: true, name: true, email: true } as const;

async function load(id: string) {
  return prisma.demoSubmission.findUnique({
    where: { id },
    include: { developer: { select: DEV_SELECT } },
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canBuildDemos(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const demo = await load(id);
  if (!demo) return NextResponse.json({ error: "That demo build doesn't exist." }, { status: 404 });
  // Same answer for "not yours" as for "not there" — a developer should not be
  // able to discover other builds by probing ids.
  if (!canView(demo, user)) {
    return NextResponse.json({ error: "That demo build doesn't exist." }, { status: 404 });
  }

  return NextResponse.json({ demo: serializeDemo(demo), viewerRole: user.role, viewerId: user.id });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canBuildDemos(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const demo = await load(id);
  if (!demo || !canView(demo, user)) {
    return NextResponse.json({ error: "That demo build doesn't exist." }, { status: 404 });
  }
  if (!canEdit(demo, user)) {
    return NextResponse.json(
      { error: "An approved build can't be edited. Start a new one instead." },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);

  // Two shapes land here: ordinary field edits, and the callback after a zip
  // finishes uploading to R2. Attaching is separated so a stray field edit can
  // never silently repoint the codebase.
  const attach = demoAttachSchema.safeParse(body);
  if (attach.success) {
    // Replacing a zip orphans the old object; drop it rather than paying to
    // store every abandoned upload forever.
    if (demo.zipKey && demo.zipKey !== attach.data.zipKey) {
      await deleteFile(demo.zipKey).catch((err) =>
        console.error("[demos] could not remove replaced zip", err),
      );
    }
    const updated = await prisma.demoSubmission.update({
      where: { id },
      data: {
        zipKey: attach.data.zipKey,
        zipName: attach.data.zipName,
        zipSize: BigInt(attach.data.zipSize),
      },
      include: { developer: { select: DEV_SELECT } },
    });
    return NextResponse.json({ demo: serializeDemo(updated) });
  }

  const parsed = demoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "That didn't validate." },
      { status: 400 },
    );
  }
  if (parsed.data.businessType && !getBrief(parsed.data.businessType)) {
    return NextResponse.json({ error: "Pick a business type from the list." }, { status: 400 });
  }

  try {
    const updated = await prisma.demoSubmission.update({
      where: { id },
      data: {
        ...parsed.data,
        // Editing after a rejection puts it back in the developer's hands.
        ...(demo.status === "CHANGES_REQUESTED" ? { status: "DRAFT" as const } : {}),
      },
      include: { developer: { select: DEV_SELECT } },
    });
    return NextResponse.json({ demo: serializeDemo(updated) });
  } catch (err) {
    console.error("[demos] update failed", err);
    return NextResponse.json({ error: "Couldn't save that change." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canBuildDemos(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const demo = await load(id);
  if (!demo || !canView(demo, user)) {
    return NextResponse.json({ error: "That demo build doesn't exist." }, { status: 404 });
  }
  if (demo.status === "SHIPPED" && user.role !== "OWNER") {
    return NextResponse.json({ error: "A shipped build can only be removed by an owner." }, { status: 403 });
  }

  if (demo.zipKey) {
    await deleteFile(demo.zipKey).catch((err) => console.error("[demos] zip cleanup failed", err));
  }
  await prisma.demoSubmission.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
