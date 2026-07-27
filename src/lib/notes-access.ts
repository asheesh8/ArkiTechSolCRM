import "server-only";

import { prisma } from "@/lib/prisma";
import { isOwner } from "@/lib/auth";

type AccessUser = { id: string; role?: string | null };

// Single source of truth for "may this user see/edit this cabinet?".
// Owners see every cabinet; anyone else needs to have created it or been
// granted a NoteCabinetShare.
export async function canAccessCabinet(user: AccessUser, cabinetId: string): Promise<boolean> {
  if (isOwner(user)) return true;
  const cabinet = await prisma.noteCabinet.findUnique({
    where: { id: cabinetId },
    select: {
      createdById: true,
      shares: { where: { userId: user.id }, select: { id: true } },
    },
  });
  if (!cabinet) return false;
  return cabinet.createdById === user.id || cabinet.shares.length > 0;
}

// Page-scoped convenience: resolves the page's cabinet, then reuses the check.
// Returns cabinetId so callers can avoid a second lookup.
export async function canAccessPage(
  user: AccessUser,
  pageId: string,
): Promise<{ ok: boolean; cabinetId: string | null }> {
  const page = await prisma.notePage.findUnique({ where: { id: pageId }, select: { cabinetId: true } });
  if (!page) return { ok: false, cabinetId: null };
  return { ok: await canAccessCabinet(user, page.cabinetId), cabinetId: page.cabinetId };
}
