import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadObject } from "@/lib/r2";
import { randomBytes } from "crypto";

// Accepts the contract file as a raw binary body and uploads it to R2
// server-side, so the browser never makes a cross-origin request to R2.
// Raw body (not multipart FormData) avoids a Safari upload bug.
export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const filename = url.searchParams.get("filename") ?? "contract.pdf";
  const contentType = req.headers.get("content-type") || "application/pdf";

  const buffer = Buffer.from(await req.arrayBuffer());
  if (!buffer.length) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  const ext = filename.split(".").pop() ?? "";
  const key = `contracts/${randomBytes(12).toString("hex")}${ext ? `.${ext}` : ""}`;

  try {
    await uploadObject(key, buffer, contentType);
  } catch (e) {
    return NextResponse.json(
      { error: `Storage upload failed: ${e instanceof Error ? e.message : "unknown error"}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ key, name: filename });
}
