import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// A teammate counts as "present" if they've sent a heartbeat recently; rows
// older than STALE_MS are treated as gone and swept on the next request.
const ACTIVE_WINDOW_MS = 15_000;
const STALE_MS = 60_000;

// Heartbeat + sync: refreshes my presence, returns who else is on the page, and
// returns the page body only when it changed since the caller's `version`.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const pageId = body.pageId as string | undefined;
    const version = body.version as string | undefined;
    if (!pageId) return NextResponse.json({ error: "pageId is required" }, { status: 400 });

    const page = await prisma.notePage.findUnique({
      where: { id: pageId },
      select: { updatedAt: true, title: true, icon: true, content: true },
    });
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    const now = Date.now();

    await prisma.notePresence.upsert({
      where: { pageId_userId: { pageId, userId: user.id } },
      update: { name: user.name },
      create: { pageId, userId: user.id, name: user.name },
    });

    // Opportunistic cleanup of ghosts (closed tabs, crashes, etc.).
    await prisma.notePresence.deleteMany({ where: { pageId, updatedAt: { lt: new Date(now - STALE_MS) } } });

    const others = await prisma.notePresence.findMany({
      where: { pageId, userId: { not: user.id }, updatedAt: { gte: new Date(now - ACTIVE_WINDOW_MS) } },
      select: { userId: true, name: true },
      orderBy: { updatedAt: "asc" },
    });

    const serverVersion = page.updatedAt.toISOString();
    const changed = version !== serverVersion;
    const pageResult = changed
      ? { updatedAt: serverVersion, changed: true, title: page.title, icon: page.icon, content: page.content }
      : { updatedAt: serverVersion, changed: false };

    return NextResponse.json({ presence: others, page: pageResult });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Presence failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pageId = new URL(req.url).searchParams.get("pageId");
  if (pageId) {
    await prisma.notePresence.deleteMany({ where: { pageId, userId: user.id } }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
