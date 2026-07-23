import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const PAGE_SELECT = {
  id: true,
  title: true,
  icon: true,
  parentId: true,
  cabinetId: true,
  sortOrder: true,
  updatedAt: true,
} as const;

async function descendantIds(pageId: string) {
  const ids: string[] = [];
  let frontier = [pageId];

  while (frontier.length) {
    const children = await prisma.notePage.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    });
    frontier = children.map((child) => child.id);
    ids.push(...frontier);
  }

  return ids;
}

function sameGroup(a: { cabinetId: string; parentId: string | null }, b: { cabinetId: string; parentId: string | null }) {
  return a.cabinetId === b.cabinetId && a.parentId === b.parentId;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const cabinetId = body.cabinetId as string | undefined;
    const parentId = (body.parentId as string | null | undefined) ?? null;
    const requestedIndex = typeof body.index === "number" && Number.isFinite(body.index)
      ? Math.trunc(body.index)
      : Number.MAX_SAFE_INTEGER;

    if (!cabinetId) return NextResponse.json({ error: "cabinetId is required" }, { status: 400 });

    const [page, cabinet, descendants] = await Promise.all([
      prisma.notePage.findUnique({ where: { id }, select: { id: true, cabinetId: true, parentId: true } }),
      prisma.noteCabinet.findUnique({ where: { id: cabinetId }, select: { id: true } }),
      descendantIds(id),
    ]);

    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    if (!cabinet) return NextResponse.json({ error: "Cabinet not found" }, { status: 404 });
    if (parentId === id || descendants.includes(parentId ?? "")) {
      return NextResponse.json({ error: "A page cannot be moved inside itself" }, { status: 400 });
    }

    if (parentId) {
      const parent = await prisma.notePage.findUnique({ where: { id: parentId }, select: { cabinetId: true } });
      if (!parent) return NextResponse.json({ error: "Parent page not found" }, { status: 404 });
      if (parent.cabinetId !== cabinetId) {
        return NextResponse.json({ error: "Parent page must be in the target cabinet" }, { status: 400 });
      }
    }

    const origin = { cabinetId: page.cabinetId, parentId: page.parentId };
    const destination = { cabinetId, parentId };
    const destinationSiblings = await prisma.notePage.findMany({
      where: { cabinetId, parentId, id: { not: id } },
      select: { id: true },
      orderBy: { sortOrder: "asc" },
    });
    const index = Math.max(0, Math.min(requestedIndex, destinationSiblings.length));
    const updates: Prisma.PrismaPromise<unknown>[] = destinationSiblings.map((sibling, i) => (
      prisma.notePage.update({
        where: { id: sibling.id },
        data: { sortOrder: i < index ? i : i + 1 },
      })
    ));

    if (!sameGroup(origin, destination)) {
      const originSiblings = await prisma.notePage.findMany({
        where: { cabinetId: origin.cabinetId, parentId: origin.parentId, id: { not: id } },
        select: { id: true },
        orderBy: { sortOrder: "asc" },
      });
      updates.push(...originSiblings.map((sibling, i) => (
        prisma.notePage.update({ where: { id: sibling.id }, data: { sortOrder: i } })
      )));
    }

    updates.push(prisma.notePage.update({
      where: { id },
      data: { cabinetId, parentId, sortOrder: index },
    }));

    if (descendants.length && page.cabinetId !== cabinetId) {
      updates.push(prisma.notePage.updateMany({
        where: { id: { in: descendants } },
        data: { cabinetId },
      }));
    }

    await prisma.$transaction(updates);

    const moved = await prisma.notePage.findUnique({ where: { id }, select: PAGE_SELECT });
    return NextResponse.json({ page: moved });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to move page" }, { status: 400 });
  }
}
