import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { sendWorkComplete } from "@/lib/email";

const INCLUDE = {
  client: { select: { id: true, name: true, businessName: true, email: true } },
  assignedDeveloper: { select: { id: true, name: true, email: true, role: true } },
  files: true,
} as const;

// Fields a non-owner (a developer working their own board) is allowed to change.
const DEV_FIELDS = new Set(["status", "actualHours", "staffNote", "repositoryUrl"]);

function numberOrNull(value: unknown) {
  return value === "" || value == null ? null : Number(value);
}

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Owners see the whole board; developers see only what's assigned to them.
  const requests = await prisma.workRequest.findMany({
    where: isOwner(session) ? undefined : { assignedDeveloperId: session.id },
    include: INCLUDE,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ requests });
}

// Create a work item straight from the CRM (internal task or client work) and
// hand it to a developer. Owner-only.
export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(session)) return NextResponse.json({ error: "Owner access is required." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const title = (body.title as string | undefined)?.trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const clientId = body.clientId ? String(body.clientId) : null;
  if (clientId) {
    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 400 });
  }

  const created = await prisma.workRequest.create({
    data: {
      clientId,
      title,
      description: (body.description as string | undefined)?.trim() || null,
      requestType: body.requestType || "INTERNAL_TASK",
      priority: body.priority || "NORMAL",
      status: "OPEN",
      assignedDeveloperId: body.assignedDeveloperId || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      estimateHours: numberOrNull(body.estimateHours),
      repositoryUrl: body.repositoryUrl || null,
    },
    include: INCLUDE,
  });

  return NextResponse.json({ request: created }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = body.id as string | undefined;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const previous = await prisma.workRequest.findUnique({
    where: { id },
    select: { status: true, assignedDeveloperId: true, title: true, client: { select: { name: true, businessName: true, email: true } } },
  });
  if (!previous) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owner = isOwner(session);
  // A developer may only touch their own request, and only delivery fields.
  if (!owner) {
    if (previous.assignedDeveloperId !== session.id) {
      return NextResponse.json({ error: "You can only update work assigned to you." }, { status: 403 });
    }
    for (const key of Object.keys(body)) {
      if (key !== "id" && !DEV_FIELDS.has(key)) {
        return NextResponse.json({ error: `You cannot change ${key}.` }, { status: 403 });
      }
    }
  }

  const { status, staffNote, requestType, priority, estimateHours, actualHours, repositoryUrl, dueDate, assignedDeveloperId } = body;

  const updated = await prisma.workRequest.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(staffNote !== undefined ? { staffNote } : {}),
      ...(actualHours !== undefined ? { actualHours: numberOrNull(actualHours) } : {}),
      ...(repositoryUrl !== undefined ? { repositoryUrl: repositoryUrl || null } : {}),
      // Owner-only fields.
      ...(owner && requestType !== undefined ? { requestType: requestType || "CLIENT_REQUEST" } : {}),
      ...(owner && priority !== undefined ? { priority: priority || "NORMAL" } : {}),
      ...(owner && estimateHours !== undefined ? { estimateHours: numberOrNull(estimateHours) } : {}),
      ...(owner && dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(owner && assignedDeveloperId !== undefined ? { assignedDeveloperId: assignedDeveloperId || null } : {}),
    },
    include: INCLUDE,
  });

  // Email the client when marked complete (skip internal tasks with no client).
  if (status === "COMPLETED" && previous.status !== "COMPLETED" && updated.client) {
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
