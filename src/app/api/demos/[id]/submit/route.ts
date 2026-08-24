import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canBuildDemos } from "@/lib/auth";
import { canView, canEdit, blockersFor, serializeDemo } from "@/lib/demos";
import { runPageSpeed } from "@/lib/pagespeed";
import { PAGESPEED_FLOOR } from "@/lib/demo-briefs";

const DEV_SELECT = { id: true, name: true, email: true } as const;

/**
 * Submit a build for review, scoring it on the way in.
 *
 * The gate runs against the developer's own preview URL rather than anything we
 * host, which is the only way it can run *before* the owner spends attention on
 * the build. A demo that cannot hit the number the public site guarantees is
 * not ready to be looked at.
 *
 * A failing score blocks submission. An unavailable scorer does not: if
 * PageSpeed is unreachable or unconfigured the build still goes to review with
 * the failure recorded, because a third-party outage should not stop a
 * developer handing in finished work.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canBuildDemos(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const demo = await prisma.demoSubmission.findUnique({ where: { id } });
  if (!demo || !canView(demo, user)) {
    return NextResponse.json({ error: "That demo build doesn't exist." }, { status: 404 });
  }
  if (!canEdit(demo, user)) {
    return NextResponse.json({ error: "That build has already been approved." }, { status: 409 });
  }

  const missing = blockersFor(demo);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Still needs ${missing.join(" and ")} before it can go for review.` },
      { status: 400 },
    );
  }

  let mobileScore: number | null = null;
  let desktopScore: number | null = null;
  let scoreWarning: string | null = null;

  try {
    // Mobile first, and separately, so a desktop failure never masks the
    // mobile number — mobile is the one that is guaranteed.
    const mobile = await runPageSpeed(demo.previewUrl!, "mobile");
    mobileScore = mobile.performance;
    try {
      const desktop = await runPageSpeed(demo.previewUrl!, "desktop");
      desktopScore = desktop.performance;
    } catch {
      scoreWarning = "Desktop score could not be measured.";
    }
  } catch (err) {
    console.error("[demos] pagespeed failed", err);
    scoreWarning =
      err instanceof Error && err.message.includes("not configured")
        ? "PageSpeed is not configured on the server, so this build was not scored."
        : "The preview URL could not be scored — check it is publicly reachable.";
  }

  if (mobileScore != null && mobileScore < PAGESPEED_FLOOR) {
    // Record the number even though we are refusing, so the developer can see
    // what it actually scored rather than guessing.
    await prisma.demoSubmission.update({
      where: { id },
      data: { mobileScore, desktopScore, scoredAt: new Date() },
    });
    return NextResponse.json(
      {
        error: `Mobile PageSpeed came back ${mobileScore}. The floor is ${PAGESPEED_FLOOR}, because that is what the site guarantees in public. Fix the preview and submit again.`,
        mobileScore,
        desktopScore,
      },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.demoSubmission.update({
      where: { id },
      data: {
        status: "SUBMITTED",
        mobileScore,
        desktopScore,
        scoredAt: mobileScore == null ? null : new Date(),
        ownerNote: null,
      },
      include: { developer: { select: DEV_SELECT } },
    });
    return NextResponse.json({ demo: serializeDemo(updated), scoreWarning });
  } catch (err) {
    console.error("[demos] submit failed", err);
    return NextResponse.json({ error: "Couldn't submit that build." }, { status: 500 });
  }
}
