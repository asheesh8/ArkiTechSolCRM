-- Where a lead came from. Null for the scraped majority that predates this;
-- "adcampaign" for inbound from the paid Facebook landing page, so the campaign
-- view can find its own leads without pattern-matching the notes field.
ALTER TABLE "Lead" ADD COLUMN "source" TEXT;

CREATE INDEX "Lead_source_createdAt_idx" ON "Lead"("source", "createdAt");
