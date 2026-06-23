import { NextRequest, NextResponse } from "next/server";
import { demoLeads } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { searchGooglePlaces } from "@/lib/places";
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
    const input = leadSearchSchema.parse(await request.json());
    let leads = await searchGooglePlaces(input);

    if (input.onlyWeakWebsite) {
      leads = leads.filter((lead: any) => !lead.website);
    }

    leads = await removeExcludedLeads(leads);

    return NextResponse.json({ leads });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    if (message.includes("GOOGLE_PLACES_API_KEY")) {
      const leads = await removeExcludedLeads(
        demoLeads.filter((lead) => lead.city?.toLowerCase().includes("r") || lead.status === "NEW"),
      );
      return NextResponse.json({
        leads,
        demo: true,
        warning: "Using demo results because GOOGLE_PLACES_API_KEY is not configured.",
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
