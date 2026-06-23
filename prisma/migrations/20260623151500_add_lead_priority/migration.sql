CREATE TYPE "LeadPriority" AS ENUM ('STANDARD', 'PRIORITY', 'FAVORITE');

ALTER TABLE "Lead" ADD COLUMN "priority" "LeadPriority" NOT NULL DEFAULT 'STANDARD';

CREATE INDEX "Lead_priority_idx" ON "Lead"("priority");
