import { NextResponse } from "next/server";
import { canBuildDemos, getCurrentUser } from "@/lib/auth";
import { inspectWebsite } from "@/lib/website-intake";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canBuildDemos(user)) {
    return NextResponse.json({ error: "Website intake is for developers and owners." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { url?: unknown } | null;
  if (typeof body?.url !== "string" || !body.url.trim()) {
    return NextResponse.json({ error: "Enter the client's website URL." }, { status: 400 });
  }

  try {
    return NextResponse.json({ intake: await inspectWebsite(body.url) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "That website could not be inspected.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
