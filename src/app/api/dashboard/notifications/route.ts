import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [workRequests, unsignedContracts, followUps, meetings, deliveryDue] = await Promise.all([
    prisma.workRequest.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS", "REVIEW"] } },
      include: {
        client: { select: { id: true, name: true, businessName: true, leadId: true } },
        assignedDeveloper: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 10,
    }),
    prisma.contract.findMany({
      where: { status: "SENT" },
      include: { client: { select: { id: true, name: true, businessName: true, leadId: true } } },
      orderBy: { sentAt: "asc" },
      take: 10,
    }),
    prisma.callNote.findMany({
      where: { followUpDate: { gte: todayStart, lte: in7Days }, lead: { status: "FOLLOW_UP" } },
      include: { lead: { select: { id: true, businessName: true, phone: true } } },
      orderBy: { followUpDate: "asc" },
      take: 10,
    }),
    prisma.lead.findMany({
      where: { status: "MEETING_BOOKED" },
      select: { id: true, businessName: true, phone: true, city: true, state: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.workRequest.findMany({
      where: { dueDate: { lte: in7Days }, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      include: {
        client: { select: { id: true, name: true, businessName: true, leadId: true } },
        assignedDeveloper: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({ workRequests, unsignedContracts, followUps, meetings, deliveryDue });
}
