import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoLeads } from "@/lib/demo-data";
import { getPlaceReviews } from "@/lib/places";
import { scrapeWebsiteImages } from "@/lib/scrape-images";
import { buildWebsiteKit, kitSlug } from "@/lib/website-kit";
import { createZip } from "@/lib/zip";

async function resolveLead(id: string) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (lead) return lead;
  } catch {
    // fall through to demo data
  }
  return demoLeads.find((item) => item.id === id) ?? null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await resolveLead(id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const [reviews, images] = await Promise.all([
    getPlaceReviews(lead.googlePlaceId),
    lead.website ? scrapeWebsiteImages(lead.website) : Promise.resolve({ logo: null, cover: null, photos: [] }),
  ]);

  const zip = createZip(buildWebsiteKit(lead, reviews, images));
  const filename = `${kitSlug(lead.businessName)}-website-kit.zip`;

  return new NextResponse(zip as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zip.length),
      "Cache-Control": "no-store",
    },
  });
}
