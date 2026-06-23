CREATE TYPE "Role" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'SAVED', 'CALLED', 'MEETING_BOOKED', 'NOT_INTERESTED', 'FOLLOW_UP', 'CLOSED');
CREATE TYPE "CallOutcome" AS ENUM ('NO_ANSWER', 'LEFT_VOICEMAIL', 'NOT_INTERESTED', 'FOLLOW_UP', 'MEETING_BOOKED', 'CLOSED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "role" "Role" NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "category" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "googlePlaceId" TEXT,
  "googleMapsUrl" TEXT,
  "googleRating" DOUBLE PRECISION,
  "googleReviewCount" INTEGER,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "websiteScore" INTEGER,
  "pageSpeedPerformance" INTEGER,
  "pageSpeedAccessibility" INTEGER,
  "pageSpeedSEO" INTEGER,
  "pageSpeedBestPractices" INTEGER,
  "notes" TEXT,
  "assignedToId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CallNote" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "callOutcome" "CallOutcome" NOT NULL,
  "followUpDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CallNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Audit" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "url" TEXT NOT NULL,
  "strategy" TEXT NOT NULL DEFAULT 'mobile',
  "performance" INTEGER,
  "accessibility" INTEGER,
  "seo" INTEGER,
  "bestPractices" INTEGER,
  "firstContentfulPaint" TEXT,
  "largestContentfulPaint" TEXT,
  "speedIndex" TEXT,
  "totalBlockingTime" TEXT,
  "cumulativeLayoutShift" TEXT,
  "opportunities" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Lead_googlePlaceId_key" ON "Lead"("googlePlaceId");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_city_state_idx" ON "Lead"("city", "state");
CREATE INDEX "Lead_category_idx" ON "Lead"("category");
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");
CREATE INDEX "CallNote_leadId_idx" ON "CallNote"("leadId");
CREATE INDEX "CallNote_userId_idx" ON "CallNote"("userId");
CREATE INDEX "CallNote_followUpDate_idx" ON "CallNote"("followUpDate");
CREATE INDEX "Audit_leadId_idx" ON "Audit"("leadId");
CREATE INDEX "Audit_url_idx" ON "Audit"("url");

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CallNote" ADD CONSTRAINT "CallNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CallNote" ADD CONSTRAINT "CallNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
