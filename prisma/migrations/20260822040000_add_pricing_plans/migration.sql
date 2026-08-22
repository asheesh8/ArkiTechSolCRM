-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "monthlyCents" INTEGER,
    "onceCents" INTEGER,
    "priceNote" TEXT,
    "features" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_slug_key" ON "PricingPlan"("slug");

-- CreateIndex
CREATE INDEX "PricingPlan_group_sortOrder_idx" ON "PricingPlan"("group", "sortOrder");
