-- CreateTable
CREATE TABLE "TwilioAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountSid" TEXT NOT NULL,
    "apiKeySid" TEXT NOT NULL,
    "twimlAppSid" TEXT NOT NULL,
    "callerId" TEXT NOT NULL,
    "friendlyName" TEXT,
    "authTokenCipher" TEXT NOT NULL,
    "apiKeySecretCipher" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwilioAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwilioAccount_userId_key" ON "TwilioAccount"("userId");

-- CreateIndex
CREATE INDEX "TwilioAccount_accountSid_idx" ON "TwilioAccount"("accountSid");

-- AddForeignKey
ALTER TABLE "TwilioAccount" ADD CONSTRAINT "TwilioAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
