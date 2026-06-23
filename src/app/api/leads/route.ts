import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoLeads } from "@/lib/demo-data";
import { getCurrentUser } from "@/lib/auth";
import { leadCreateSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("search") ?? undefined;
  const status = params.get("status") ?? undefined;
  const city = params.get("city") ?? undefined;
  const category = params.get("category") ?? undefined;

  try {
    const leads = await prisma.lead.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
        ...(search
          ? {
              OR: [
                { businessName: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { website: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { assignedTo: { select: { id: true, name: true, email: true } }, _count: { select: { callNotes: true, audits: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ leads: demoLeads, demo: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in before saving leads." }, { status: 401 });
    }

    const payload = leadCreateSchema.parse(await request.json());
    const notes = payload.notes?.includes("Saved from scraper")
      ? payload.notes
      : [payload.notes, "Saved from scraper"].filter(Boolean).join("\n");
    const data = {
      ...payload,
      notes,
      assignedToId: payload.assignedToId ?? user.id,
      status: payload.status ?? "SAVED",
    };
    const lead = await prisma.lead.upsert({
      where: payload.googlePlaceId ? { googlePlaceId: payload.googlePlaceId } : { id: "__missing__" },
      update: data,
      create: data,
    });
    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save lead" }, { status: 400 });
  }
}
