-- CreateEnum
CREATE TYPE "DemoStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'SHIPPED');

-- CreateTable
CREATE TABLE "DemoSubmission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "status" "DemoStatus" NOT NULL DEFAULT 'DRAFT',
    "previewUrl" TEXT,
    "zipKey" TEXT,
    "zipName" TEXT,
    "zipSize" BIGINT,
    "notes" TEXT,
    "ownerNote" TEXT,
    "mobileScore" INTEGER,
    "desktopScore" INTEGER,
    "scoredAt" TIMESTAMP(3),
    "repoUrl" TEXT,
    "deployUrl" TEXT,
    "shippedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DemoSubmission_developerId_idx" ON "DemoSubmission"("developerId");

-- CreateIndex
CREATE INDEX "DemoSubmission_status_idx" ON "DemoSubmission"("status");

-- AddForeignKey
ALTER TABLE "DemoSubmission" ADD CONSTRAINT "DemoSubmission_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
