-- CreateEnum
CREATE TYPE "WorkLogKind" AS ENUM ('CLIENT_BILLABLE', 'COMPANY');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "hourlyRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "OwnerWorkLog" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "kind" "WorkLogKind" NOT NULL DEFAULT 'COMPANY';

-- CreateIndex
CREATE INDEX "OwnerWorkLog_clientId_idx" ON "OwnerWorkLog"("clientId");

-- CreateIndex
CREATE INDEX "OwnerWorkLog_invoiceId_idx" ON "OwnerWorkLog"("invoiceId");

-- AddForeignKey
ALTER TABLE "OwnerWorkLog" ADD CONSTRAINT "OwnerWorkLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerWorkLog" ADD CONSTRAINT "OwnerWorkLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
