CREATE TYPE "LeadExclusionReason" AS ENUM ('ARCHIVED', 'DECLINED');

CREATE TABLE "LeadExclusion" (
  "id" TEXT NOT NULL,
  "googlePlaceId" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "reason" "LeadExclusionReason" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadExclusion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LeadExclusion_googlePlaceId_key" ON "LeadExclusion"("googlePlaceId");
CREATE INDEX "LeadExclusion_reason_idx" ON "LeadExclusion"("reason");
