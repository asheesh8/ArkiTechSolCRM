import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadExclusionSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const payload = leadExclusionSchema.parse(await request.json());
    const exclusion = await prisma.leadExclusion.upsert({
      where: { googlePlaceId: payload.googlePlaceId },
      update: {
        businessName: payload.businessName,
        reason: payload.reason,
      },
      create: payload,
    });

    return NextResponse.json({ exclusion }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to hide this business" },
      { status: 400 },
    );
  }
}
