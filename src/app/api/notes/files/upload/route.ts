import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { publicUrl, uploadObject } from "@/lib/r2";

export const runtime = "nodejs";

function fileExt(filename: string) {
  const clean = filename.split(/[\\/]/).pop() ?? "file";
  const ext = clean.includes(".") ? clean.split(".").pop() : "";
  return ext?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) ?? "";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const filename = url.searchParams.get("filename")?.trim() || "attachment";
  const contentType = req.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await req.arrayBuffer());

  if (!buffer.length) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  const ext = fileExt(filename);
  const key = `notes/${randomBytes(12).toString("hex")}${ext ? `.${ext}` : ""}`;

  try {
    await uploadObject(key, buffer, contentType);
  } catch (error) {
    return NextResponse.json(
      { error: `Storage upload failed: ${error instanceof Error ? error.message : "unknown error"}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ key, name: filename, url: publicUrl(key) });
}
