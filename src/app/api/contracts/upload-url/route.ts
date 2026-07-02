import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { presignUpload } from "@/lib/r2";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, contentType } = await req.json();
  if (!fileName || !contentType) {
    return NextResponse.json({ error: "fileName and contentType required" }, { status: 400 });
  }

  const ext = fileName.split(".").pop() ?? "";
  const key = `contracts/${randomBytes(12).toString("hex")}${ext ? `.${ext}` : ""}`;
  const { uploadUrl } = await presignUpload(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}
