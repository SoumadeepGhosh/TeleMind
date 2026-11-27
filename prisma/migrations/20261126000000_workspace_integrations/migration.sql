CREATE TYPE "IntegrationProvider" AS ENUM ('TELEGRAM', 'WHATSAPP_DEMO');
CREATE TYPE "IntegrationStatus" AS ENUM ('PENDING', 'CONNECTED', 'DISCONNECTED', 'ERROR');

CREATE TABLE "integrations" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL,
  "provider" "IntegrationProvider" NOT NULL,
  "demoSlot" INTEGER,
  "status" "IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
  "credentialsEncrypted" TEXT,
  "externalName" VARCHAR(255),
  "lastError" TEXT,
  "connectedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "integrations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "integrations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "integrations_organizationId_provider_key" ON "integrations"("organizationId", "provider");
CREATE UNIQUE INDEX "integrations_provider_externalName_key" ON "integrations"("provider", "externalName");
CREATE INDEX "integrations_provider_status_idx" ON "integrations"("provider", "status");
CREATE UNIQUE INDEX "integrations_demoSlot_key" ON "integrations"("demoSlot");

DROP INDEX IF EXISTS "telegram_chats_chatId_key";
ALTER TABLE "telegram_chats" ADD COLUMN "organizationId" UUID;
ALTER TABLE "telegram_chats" ADD CONSTRAINT "telegram_chats_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "telegram_chats_organizationId_chatId_key" ON "telegram_chats"("organizationId", "chatId");
