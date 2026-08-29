import { NextResponse } from "next/server";
import { canBuildDemos, getCurrentUser } from "@/lib/auth";
import { listReferenceRepos } from "@/lib/github";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!canBuildDemos(user)) {
    return NextResponse.json({ error: "Developer references are for developers and owners." }, { status: 403 });
  }

  try {
    return NextResponse.json(await listReferenceRepos());
  } catch (error) {
    console.error("[developer-repositories] list failed", error);
    return NextResponse.json(
      { error: "The repository shelf is temporarily unavailable." },
      { status: 502 },
    );
  }
}
