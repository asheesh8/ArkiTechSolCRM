-- Replace forgeable user-id cookies with revocable, opaque staff sessions.
CREATE TABLE "StaffSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffSession_tokenHash_key" ON "StaffSession"("tokenHash");
CREATE INDEX "StaffSession_userId_idx" ON "StaffSession"("userId");
CREATE INDEX "StaffSession_expiresAt_idx" ON "StaffSession"("expiresAt");

ALTER TABLE "StaffSession" ADD CONSTRAINT "StaffSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Track whether a provider detail payload was archived for the current status,
-- and retain the receptionist's dynamic intake variables independently.
ALTER TABLE "ReceptionistConversation"
  ADD COLUMN "initiationData" JSONB,
  ADD COLUMN "detailStatus" TEXT,
  ADD COLUMN "detailSyncedAt" TIMESTAMP(3);

UPDATE "ReceptionistConversation"
SET "detailStatus" = "status", "detailSyncedAt" = "syncedAt"
WHERE "metadata" IS NOT NULL;
