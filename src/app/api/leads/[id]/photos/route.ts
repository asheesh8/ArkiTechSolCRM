import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoLeads } from "@/lib/demo-data";
import { scrapeWebsiteImages } from "@/lib/scrape-images";

async function resolveWebsite(id: string): Promise<string | null> {
  try {
    const lead = await prisma.lead.findUnique({ where: { id }, select: { website: true } });
    return lead?.website ?? null;
  } catch {
    const demo = demoLeads.find((item) => item.id === id) ?? demoLeads[0];
    return demo?.website ?? null;
  }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const website = await resolveWebsite(id);
  if (!website) {
    return NextResponse.json({ website: null, logo: null, cover: null, photos: [] });
  }
  const images = await scrapeWebsiteImages(website);
  return NextResponse.json({ website, ...images });
}
