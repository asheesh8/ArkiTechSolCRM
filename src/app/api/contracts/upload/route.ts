import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadObject } from "@/lib/r2";
import { randomBytes } from "crypto";

// Accepts the contract file directly and uploads it to R2 server-side,
// so the browser never has to make a cross-origin request to R2.
export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "";
  const key = `contracts/${randomBytes(12).toString("hex")}${ext ? `.${ext}` : ""}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadObject(key, buffer, file.type || "application/pdf");
  } catch (e) {
    return NextResponse.json(
      { error: `Storage upload failed: ${e instanceof Error ? e.message : "unknown error"}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ key, name: file.name });
}
