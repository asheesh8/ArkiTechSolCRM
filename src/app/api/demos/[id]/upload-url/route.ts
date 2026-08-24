import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canBuildDemos } from "@/lib/auth";
import { canView, canEdit } from "@/lib/demos";
import { presignUpload } from "@/lib/r2";

/**
 * Hands back a presigned PUT so the browser uploads the zip straight to R2.
 *
 * The file deliberately does not pass through this function. A serverless
 * request body caps out around 4.5MB and a codebase is nowhere near that, so
 * the raw-body approach used for contract PDFs would fail on the first real
 * upload. Presigning also keeps a multi-hundred-megabyte transfer off the
 * function's execution time.
 */

// Generous, but not unbounded: a demo with node_modules stripped is single-digit
// megabytes, and anything approaching this is a mistake worth catching.
const MAX_BYTES = 200 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canBuildDemos(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const demo = await prisma.demoSubmission.findUnique({ where: { id } });
  if (!demo || !canView(demo, user)) {
    return NextResponse.json({ error: "That demo build doesn't exist." }, { status: 404 });
  }
  if (!canEdit(demo, user)) {
    return NextResponse.json({ error: "An approved build can't be changed." }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const filename = typeof body.filename === "string" ? body.filename : "demo.zip";
  const size = Number(body.size);

  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "That file looks empty." }, { status: 400 });
  }
  if (size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `That zip is ${(size / 1024 / 1024).toFixed(0)}MB. The limit is ${MAX_BYTES / 1024 / 1024}MB — node_modules and .next are almost always the reason a demo zip gets this big.`,
      },
      { status: 400 },
    );
  }
  if (!filename.toLowerCase().endsWith(".zip")) {
    return NextResponse.json({ error: "Upload a .zip of the project folder." }, { status: 400 });
  }

  // Random key rather than the filename: two developers both uploading
  // "demo.zip" must not collide, and the name is kept on the row anyway.
  const key = `demos/${id}/${randomBytes(10).toString("hex")}.zip`;

  try {
    const { uploadUrl } = await presignUpload(key, "application/zip");
    return NextResponse.json({ uploadUrl, key });
  } catch (err) {
    console.error("[demos] presign failed", err);
    return NextResponse.json({ error: "Couldn't start the upload." }, { status: 500 });
  }
}
