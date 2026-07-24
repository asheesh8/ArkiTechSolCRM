-- Developer delivery workflow fields for internal operations.
ALTER TABLE "WorkRequest"
  ADD COLUMN "requestType" TEXT NOT NULL DEFAULT 'CLIENT_REQUEST',
  ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN "estimateHours" DOUBLE PRECISION,
  ADD COLUMN "actualHours" DOUBLE PRECISION,
  ADD COLUMN "repositoryUrl" TEXT,
  ADD COLUMN "dueDate" TIMESTAMP(3),
  ADD COLUMN "assignedDeveloperId" TEXT;

CREATE INDEX "WorkRequest_assignedDeveloperId_idx" ON "WorkRequest"("assignedDeveloperId");
CREATE INDEX "WorkRequest_dueDate_idx" ON "WorkRequest"("dueDate");

ALTER TABLE "WorkRequest"
  ADD CONSTRAINT "WorkRequest_assignedDeveloperId_fkey"
  FOREIGN KEY ("assignedDeveloperId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
