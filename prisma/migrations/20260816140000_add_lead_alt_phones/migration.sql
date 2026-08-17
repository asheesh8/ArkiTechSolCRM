-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "altPhones" TEXT[] DEFAULT ARRAY[]::TEXT[];
