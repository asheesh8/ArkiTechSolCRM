import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  if (!email || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await sendContactEmail({ fromEmail: email, subject: name || "New project inquiry", message });
  return NextResponse.json({ ok: true });
}
