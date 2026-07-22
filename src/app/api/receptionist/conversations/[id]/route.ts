import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isManager } from "@/lib/auth";
import { publicConversationFields } from "@/lib/elevenlabs";
import { prisma } from "@/lib/prisma";

const noteSchema = z.object({
  internalNote: z.string().trim().max(5_000),
});

type RouteContext = { params: Promise<{ id: string }> };

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

async function requireManager() {
  const user = await getCurrentUser();
  if (!user) return noStoreJson({ error: "Unauthorized" }, { status: 401 });
  if (!isManager(user)) return noStoreJson({ error: "Manager access is required." }, { status: 403 });
  return null;
}

async function findConversation(id: string) {
  return prisma.receptionistConversation.findUnique({
    where: { id },
    include: {
      lead: { select: { id: true, businessName: true } },
      messages: {
        orderBy: { sequence: "asc" },
        select: {
          id: true,
          sequence: true,
          role: true,
          message: true,
          timeInCallSecs: true,
          interrupted: true,
          sourceMedium: true,
        },
      },
    },
  });
}

function toDetail(conversation: NonNullable<Awaited<ReturnType<typeof findConversation>>>) {
  return {
    ...publicConversationFields(conversation),
    internalNote: conversation.internalNote,
    lead: conversation.lead,
    messages: conversation.messages,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const denied = await requireManager();
  if (denied) return denied;

  const { id } = await context.params;
  const conversation = await findConversation(id);
  if (!conversation) return noStoreJson({ error: "Conversation not found." }, { status: 404 });

  return noStoreJson({ conversation: toDetail(conversation) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await requireManager();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "A valid JSON body is required." }, { status: 400 });
  }
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return noStoreJson({ error: "The internal note must be 5,000 characters or fewer." }, { status: 400 });
  }

  const { id } = await context.params;
  const existing = await prisma.receptionistConversation.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return noStoreJson({ error: "Conversation not found." }, { status: 404 });

  await prisma.receptionistConversation.update({
    where: { id },
    data: { internalNote: parsed.data.internalNote || null },
  });
  const conversation = await findConversation(id);
  if (!conversation) return noStoreJson({ error: "Conversation not found." }, { status: 404 });

  return noStoreJson({ conversation: toDetail(conversation) });
}
