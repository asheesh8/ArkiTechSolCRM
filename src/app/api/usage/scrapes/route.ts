import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getScrapeUsage } from "@/lib/scrape-usage";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to view scrape usage." }, { status: 401 });
  }

  const usage = await getScrapeUsage(user.id);
  return NextResponse.json({ usage });
}
