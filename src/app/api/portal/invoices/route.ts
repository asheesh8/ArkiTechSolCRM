import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const client = await getPortalSession();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invoices = await prisma.invoice.findMany({
    where: { clientId: client.id },
    orderBy: { dueDate: "desc" },
  });
  return NextResponse.json({ invoices });
}
