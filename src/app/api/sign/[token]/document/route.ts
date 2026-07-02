import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { r2 } from "@/lib/r2";

const BUCKET = process.env.R2_BUCKET ?? "arkitech-portal";

// Serves the uploaded contract PDF to the signer, authorized by the sign token.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = await prisma.contract.findUnique({
    where: { signToken: token },
    select: { documentKey: true },
  });
  if (!contract?.documentKey) {
    return NextResponse.json({ error: "No document attached" }, { status: 404 });
  }

  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: contract.documentKey });
    const url = await getSignedUrl(r2, cmd, { expiresIn: 300 });
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
