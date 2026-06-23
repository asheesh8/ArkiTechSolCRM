CREATE TYPE "NoteType" AS ENUM ('GENERAL', 'FOLLOW_UP', 'MEETING');

ALTER TABLE "CallNote" ADD COLUMN "noteType" "NoteType" NOT NULL DEFAULT 'GENERAL';

CREATE INDEX "CallNote_noteType_idx" ON "CallNote"("noteType");
