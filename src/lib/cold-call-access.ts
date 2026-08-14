import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";

// The notes share table already provides durable per-user access. This hidden
// cabinet is only a namespace for the cold-call workspace's viewer list.
export const COLD_CALL_ACCESS_CABINET_ID = "cold-call-playbook-access";

export const canAccessColdCall = cache(async (userId: string, role?: string | null) => {
  if (role === "OWNER") return true;

  const share = await prisma.noteCabinetShare.findUnique({
    where: {
      cabinetId_userId: {
        cabinetId: COLD_CALL_ACCESS_CABINET_ID,
        userId,
      },
    },
    select: { id: true },
  });

  return Boolean(share);
});

export async function replaceColdCallViewers(ownerId: string, requestedUserIds: string[]) {
  const targets = await prisma.user.findMany({
    where: {
      id: { in: requestedUserIds },
      role: { not: "OWNER" },
      isActive: true,
    },
    select: { id: true },
  });
  const userIds = targets.map((user) => user.id);

  await prisma.$transaction(async (tx) => {
    await tx.noteCabinet.upsert({
      where: { id: COLD_CALL_ACCESS_CABINET_ID },
      update: {},
      create: {
        id: COLD_CALL_ACCESS_CABINET_ID,
        name: "Cold Call Playbook Access",
        icon: "phone",
        color: "emerald",
        sortOrder: -1,
        createdById: ownerId,
      },
    });

    await tx.noteCabinetShare.deleteMany({
      where: { cabinetId: COLD_CALL_ACCESS_CABINET_ID },
    });

    if (userIds.length > 0) {
      await tx.noteCabinetShare.createMany({
        data: userIds.map((userId) => ({
          cabinetId: COLD_CALL_ACCESS_CABINET_ID,
          userId,
        })),
        skipDuplicates: true,
      });
    }
  });

  return userIds;
}
