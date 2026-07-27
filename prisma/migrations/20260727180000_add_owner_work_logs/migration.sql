-- Owner clock-in/out records for Ashish and Terri's admin activity log.
CREATE TABLE "OwnerWorkLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "workSummary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OwnerWorkLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OwnerWorkLog_userId_idx" ON "OwnerWorkLog"("userId");
CREATE INDEX "OwnerWorkLog_startedAt_idx" ON "OwnerWorkLog"("startedAt");
CREATE INDEX "OwnerWorkLog_endedAt_idx" ON "OwnerWorkLog"("endedAt");

ALTER TABLE "OwnerWorkLog"
  ADD CONSTRAINT "OwnerWorkLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
