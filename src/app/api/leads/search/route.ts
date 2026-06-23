import { NextRequest, NextResponse } from "next/server";
import { demoLeads } from "@/lib/demo-data";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchGooglePlaces } from "@/lib/places";
import { getScrapeUsage, recordScrapeUsage } from "@/lib/scrape-usage";
import { leadSearchSchema } from "@/lib/schemas";

async function removeExcludedLeads(leads: any[]) {
  const placeIds = leads.map((lead) => lead.googlePlaceId).filter(Boolean);
  if (!placeIds.length) return leads;

  const exclusions = await prisma.leadExclusion.findMany({
    where: { googlePlaceId: { in: placeIds } },
    select: { googlePlaceId: true },
  });
  const excluded = new Set(exclusions.map((item) => item.googlePlaceId));

  return leads.filter((lead) => !excluded.has(lead.googlePlaceId));
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in before searching for leads." }, { status: 401 });
    }

    const input = leadSearchSchema.parse(await request.json());
    const beforeUsage = await getScrapeUsage(user.id);
    if (beforeUsage.remainingToday <= 0) {
      return NextResponse.json(
        {
          error: "Daily scrape limit reached. Ashish and Terri each get 200 searches per day.",
          usage: beforeUsage,
        },
        { status: 429 },
      );
    }

    let leads = await searchGooglePlaces(input);
    const usage = await recordScrapeUsage(user.id);

    if (input.onlyWeakWebsite) {
      leads = leads.filter((lead: any) => !lead.website);
    }

    leads = await removeExcludedLeads(leads);

    return NextResponse.json({ leads, usage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    if (message.includes("GOOGLE_PLACES_API_KEY")) {
      const user = await getCurrentUser();
      const usage = user ? await getScrapeUsage(user.id) : null;
      const leads = await removeExcludedLeads(
        demoLeads.filter((lead) => lead.city?.toLowerCase().includes("r") || lead.status === "NEW"),
      );
      return NextResponse.json({
        leads,
        usage,
        demo: true,
        warning: "Using demo results because GOOGLE_PLACES_API_KEY is not configured.",
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
