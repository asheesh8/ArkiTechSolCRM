-- Catalog the ElevenLabs agents on the account so the CRM can map each one to a
-- client and expose it as a prospect-facing demo. Agent config stays authored
-- upstream in ElevenLabs; only the CRM-side facts live here.
CREATE TABLE "VoiceAgent" (
    "id" TEXT NOT NULL,
    "providerAgentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "clientId" TEXT,
    "demoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "demoHeadline" TEXT,
    "demoSubheadline" TEXT,
    "demoBusiness" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceAgent_pkey" PRIMARY KEY ("id")
);

-- One prospect demo conversation. Doubles as the rate-limit ledger for the
-- public demo page, so a scraped link cannot burn through voice credits.
CREATE TABLE "VoiceDemoSession" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceDemoSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VoiceAgent_providerAgentId_key" ON "VoiceAgent"("providerAgentId");
CREATE UNIQUE INDEX "VoiceAgent_slug_key" ON "VoiceAgent"("slug");
CREATE INDEX "VoiceAgent_clientId_idx" ON "VoiceAgent"("clientId");
CREATE INDEX "VoiceAgent_demoEnabled_idx" ON "VoiceAgent"("demoEnabled");
CREATE INDEX "VoiceDemoSession_agentId_createdAt_idx" ON "VoiceDemoSession"("agentId", "createdAt");
CREATE INDEX "VoiceDemoSession_ipHash_createdAt_idx" ON "VoiceDemoSession"("ipHash", "createdAt");

ALTER TABLE "VoiceAgent" ADD CONSTRAINT "VoiceAgent_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VoiceDemoSession" ADD CONSTRAINT "VoiceDemoSession_agentId_fkey"
    FOREIGN KEY ("agentId") REFERENCES "VoiceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
