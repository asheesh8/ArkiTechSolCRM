-- Keep frequent syncs incremental while periodically reconciling all provider
-- history so a missed webhook cannot leave a permanent gap.
CREATE TABLE "ReceptionistSyncState" (
    "agentId" TEXT NOT NULL,
    "lastIncrementalAt" TIMESTAMP(3),
    "lastFullReconcileAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceptionistSyncState_pkey" PRIMARY KEY ("agentId")
);
