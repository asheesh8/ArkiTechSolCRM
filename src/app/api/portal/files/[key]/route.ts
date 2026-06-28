import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { getCurrentUser } from "@/lib/auth";
import { getPortalSession } from "@/lib/portal-auth";

const BUCKET = process.env.R2_BUCKET ?? "arkitech-portal";

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  // Accept either staff session or client portal session
  const [staffUser, clientSession] = await Promise.all([getCurrentUser(), getPortalSession()]);
  if (!staffUser && !clientSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const decodedKey = decodeURIComponent(key);

  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: decodedKey });
    const url = await getSignedUrl(r2, cmd, { expiresIn: 300 }); // 5 min presigned URL
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
