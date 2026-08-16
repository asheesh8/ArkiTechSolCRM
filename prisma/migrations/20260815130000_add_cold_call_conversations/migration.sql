-- AlterTable
ALTER TABLE "ReceptionistConversation" ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "recordingKey" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "agentId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ReceptionistConversation_source_startedAt_idx" ON "ReceptionistConversation"("source", "startedAt");

-- CreateIndex
CREATE INDEX "ReceptionistConversation_userId_idx" ON "ReceptionistConversation"("userId");

-- AddForeignKey
ALTER TABLE "ReceptionistConversation" ADD CONSTRAINT "ReceptionistConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
