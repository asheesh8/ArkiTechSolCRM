-- Voice agents can now run on either provider. ElevenLabs hosts the persona in
-- its own dashboard; OpenAI Realtime has no agent object at all, so the prompt
-- and voice have to live here and be sent when the session is opened.
ALTER TABLE "VoiceAgent" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'elevenlabs';
ALTER TABLE "VoiceAgent" ADD COLUMN "instructions" TEXT;
ALTER TABLE "VoiceAgent" ADD COLUMN "voice" TEXT;

CREATE INDEX "VoiceAgent_provider_idx" ON "VoiceAgent"("provider");
