import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { demoLeads } from "@/lib/demo-data";

const statuses = ["NEW", "SAVED", "CALLED", "MEETING_BOOKED", "NOT_INTERESTED", "FOLLOW_UP", "CLOSED"];

export async function GET() {
  // Pipeline stats are sales data — require a session and keep them away from developers.
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "DEV") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLeads, callsMadeToday, meetingsBooked, followUpsDue, closedCount, pipeline] =
      await Promise.all([
        prisma.lead.count(),
        prisma.callNote.count({ where: { createdAt: { gte: today } } }),
        prisma.lead.count({ where: { status: "MEETING_BOOKED" } }),
        prisma.callNote.count({ where: { followUpDate: { lte: new Date() }, lead: { status: "FOLLOW_UP" } } }),
        prisma.lead.count({ where: { status: "CLOSED" } }),
        prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
      ]);

    return NextResponse.json({
      totalLeads,
      callsMadeToday,
      meetingsBooked,
      followUpsDue,
      closeRate: totalLeads ? Math.round((closedCount / totalLeads) * 100) : 0,
      pipeline: statuses.map((status) => ({
        status,
        count: pipeline.find((item) => item.status === status)?._count.status ?? 0,
      })),
    });
  } catch {
    const totalLeads = demoLeads.length;
    const closedCount = demoLeads.filter((lead) => lead.status === "CLOSED").length;
    return NextResponse.json({
      totalLeads,
      callsMadeToday: 1,
      meetingsBooked: demoLeads.filter((lead) => lead.status === "MEETING_BOOKED").length,
      followUpsDue: 1,
      closeRate: totalLeads ? Math.round((closedCount / totalLeads) * 100) : 0,
      pipeline: statuses.map((status) => ({
        status,
        count: demoLeads.filter((lead) => lead.status === status).length,
      })),
      demo: true,
    });
  }
}
