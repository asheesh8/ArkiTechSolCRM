-- AlterTable
ALTER TABLE "TwilioAccount" ADD COLUMN "smsAccountSid" TEXT,
ADD COLUMN "smsAuthTokenCipher" TEXT,
ADD COLUMN "smsFrom" TEXT;
