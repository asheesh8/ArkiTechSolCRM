import { NextRequest, NextResponse } from "next/server";
import { demoLeads } from "@/lib/demo-data";
import { searchGooglePlaces } from "@/lib/places";
import { leadSearchSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const input = leadSearchSchema.parse(await request.json());
    let leads = await searchGooglePlaces(input);

    if (input.onlyWeakWebsite) {
      leads = leads.filter((lead: any) => !lead.website);
    }

    return NextResponse.json({ leads });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    if (message.includes("GOOGLE_PLACES_API_KEY")) {
      return NextResponse.json({
        leads: demoLeads.filter((lead) => lead.city?.toLowerCase().includes("r") || lead.status === "NEW"),
        demo: true,
        warning: "Using demo results because GOOGLE_PLACES_API_KEY is not configured.",
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
