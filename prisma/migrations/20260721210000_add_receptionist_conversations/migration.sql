-- Persist ElevenLabs receptionist calls independently of provider retention.
CREATE TABLE "ReceptionistConversation" (
    "id" TEXT NOT NULL,
    "providerConversationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentName" TEXT,
    "status" TEXT NOT NULL,
    "callSuccessful" TEXT,
    "callSuccessScore" DOUBLE PRECISION,
    "title" TEXT,
    "summary" TEXT,
    "searchText" TEXT,
    "callerPhone" TEXT,
    "agentPhone" TEXT,
    "direction" TEXT,
    "initiationSource" TEXT,
    "mainLanguage" TEXT,
    "terminationReason" TEXT,
    "durationSecs" INTEGER NOT NULL DEFAULT 0,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "hasAudio" BOOLEAN NOT NULL DEFAULT false,
    "costFiat" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION,
    "sentimentLabel" TEXT,
    "metadata" JSONB,
    "analysis" JSONB,
    "tagIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "internalNote" TEXT,
    "leadId" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceptionistConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReceptionistMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT,
    "timeInCallSecs" DOUBLE PRECISION,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "sourceMedium" TEXT,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReceptionistMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReceptionistConversation_providerConversationId_key" ON "ReceptionistConversation"("providerConversationId");
CREATE INDEX "ReceptionistConversation_agentId_startedAt_idx" ON "ReceptionistConversation"("agentId", "startedAt");
CREATE INDEX "ReceptionistConversation_startedAt_idx" ON "ReceptionistConversation"("startedAt");
CREATE INDEX "ReceptionistConversation_status_idx" ON "ReceptionistConversation"("status");
CREATE INDEX "ReceptionistConversation_callSuccessful_idx" ON "ReceptionistConversation"("callSuccessful");
CREATE INDEX "ReceptionistConversation_callerPhone_idx" ON "ReceptionistConversation"("callerPhone");
CREATE INDEX "ReceptionistConversation_leadId_idx" ON "ReceptionistConversation"("leadId");
CREATE UNIQUE INDEX "ReceptionistMessage_conversationId_sequence_key" ON "ReceptionistMessage"("conversationId", "sequence");
CREATE INDEX "ReceptionistMessage_conversationId_idx" ON "ReceptionistMessage"("conversationId");
CREATE INDEX "ReceptionistMessage_role_idx" ON "ReceptionistMessage"("role");

ALTER TABLE "ReceptionistConversation" ADD CONSTRAINT "ReceptionistConversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReceptionistMessage" ADD CONSTRAINT "ReceptionistMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ReceptionistConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
