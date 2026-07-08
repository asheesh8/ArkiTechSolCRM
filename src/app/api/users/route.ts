import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Team roster used to populate "Assigned to" pickers across the CRM.
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
