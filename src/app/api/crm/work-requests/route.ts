import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendWorkComplete } from "@/lib/email";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.workRequest.findMany({
    include: {
      client: { select: { id: true, name: true, businessName: true, email: true } },
      assignedDeveloper: { select: { id: true, name: true, email: true, role: true } },
      files: true,
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ requests });
}

export async function PATCH(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, staffNote, requestType, priority, estimateHours, actualHours, repositoryUrl, dueDate, assignedDeveloperId } = await req.json();

  const previous = await prisma.workRequest.findUnique({
    where: { id },
    select: { status: true, title: true, client: { select: { name: true, businessName: true, email: true } } },
  });

  const updated = await prisma.workRequest.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(staffNote !== undefined ? { staffNote } : {}),
      ...(requestType !== undefined ? { requestType: requestType || "CLIENT_REQUEST" } : {}),
      ...(priority !== undefined ? { priority: priority || "NORMAL" } : {}),
      ...(estimateHours !== undefined ? { estimateHours: estimateHours === "" || estimateHours == null ? null : Number(estimateHours) } : {}),
      ...(actualHours !== undefined ? { actualHours: actualHours === "" || actualHours == null ? null : Number(actualHours) } : {}),
      ...(repositoryUrl !== undefined ? { repositoryUrl: repositoryUrl || null } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(assignedDeveloperId !== undefined ? { assignedDeveloperId: assignedDeveloperId || null } : {}),
    },
    include: {
      client: { select: { id: true, name: true, businessName: true, email: true } },
      assignedDeveloper: { select: { id: true, name: true, email: true, role: true } },
      files: true,
    },
  });

  // Email client when marked complete
  if (status === "COMPLETED" && previous?.status !== "COMPLETED") {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://arkitech-sol.com";
    await sendWorkComplete({
      to: updated.client.email,
      clientName: updated.client.name,
      businessName: updated.client.businessName,
      requestTitle: updated.title,
      portalUrl: `${baseUrl}/portal/requests`,
    });
  }

  return NextResponse.json({ request: updated });
}
