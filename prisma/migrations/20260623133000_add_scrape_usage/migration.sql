CREATE TABLE "ScrapeUsage" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "dateKey" TEXT NOT NULL,
  "monthKey" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScrapeUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScrapeUsage_userId_dateKey_key" ON "ScrapeUsage"("userId", "dateKey");
CREATE INDEX "ScrapeUsage_monthKey_idx" ON "ScrapeUsage"("monthKey");
CREATE INDEX "ScrapeUsage_userId_monthKey_idx" ON "ScrapeUsage"("userId", "monthKey");

ALTER TABLE "ScrapeUsage" ADD CONSTRAINT "ScrapeUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
