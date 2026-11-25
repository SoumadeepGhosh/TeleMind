# TeleMind Multi-Tenant SaaS Build Plan & Technical Blueprint

---

## 1. Product Vision & Executive Summary

**TeleMind** is an enterprise-ready, multi-tenant AI Knowledge Assistant platform. It enables businesses (clinics, e-commerce stores, real estate agencies, law firms, customer service teams) to:
1. Connect their official **WhatsApp Business** and **Telegram** channels.
2. Upload their private documents, FAQs, and pricing sheets into an **isolated Knowledge Base**.
3. Deploy an AI assistant powered by **Groq 120B** (high-speed primary inference) and **Google Gemini** (embeddings and fallback).
4. Monitor customer chats live from a **Team Web Dashboard** with a one-click **Human Takeover ("Pause AI")** switch.
5. Pay via tiered **Stripe subscriptions** with automated usage quotas.

---

## 2. Multi-Tenant Data Isolation Strategy

> **Core Principle:** Every piece of customer data (documents, vector chunks, messages, conversations, and settings) belongs strictly to one `organizationId`. Cross-tenant data leakage is prevented by design at three distinct layers:

```mermaid
flowchart TD
    subgraph ClientLayer [1. Client / Webhook Layer]
        A1["Web User (Admin/Agent)"] -->|"JWT Token with { userId, organizationId }"| B1["TenantGuard"]
        A2["Customer WhatsApp Message"] -->|"Phone ID (+1-555-0100)"| B2["Resolve Integration -> organizationId"]
    end

    subgraph ServiceLayer [2. Application & RAG Layer]
        B1 --> C1["Scope All API Operations to organizationId"]
        B2 --> C2["Load BotSettings & History for organizationId"]
        C2 --> D1["RAG Vector Search Filter:\nWHERE organizationId = :orgId"]
    end

    subgraph DatabaseLayer [3. PostgreSQL (pgvector) Layer]
        D1 --> E1["Tenant-Isolated Embeddings & Document Chunks"]
    end
```

### 1. Database Foreign Keys (`organizationId`)
Every database table (except global system logs) includes a required `organizationId` foreign key referencing the `Organization` table.

### 2. Isolated Semantic Vector Search (pgvector)
Vector similarity queries never scan the entire table. Every similarity search strictly includes a tenant filter:
```sql
SELECT id, content, (1 - (embedding <=> $1)) AS similarity
FROM "DocumentChunk"
WHERE "organizationId" = $2
ORDER BY similarity DESC
LIMIT 5;
```

### 3. NestJS TenantGuard & Request Decorators
Every REST endpoint is protected by `@UseGuards(JwtAuthGuard, TenantGuard)` and extracts `@CurrentOrg()` from the verified JWT:
```typescript
@Get('conversations')
async listConversations(@CurrentOrg() orgId: string) {
  return this.conversationsService.findAllForOrg(orgId);
}
```

---

## 3. Architecture & Channel Integration Model

### WhatsApp: Official Meta WhatsApp Business Cloud API
- **Why not `whatsapp-web.js` for SaaS?**
  - `whatsapp-web.js` runs a local Chromium browser for a single user phone number.
  - In a multi-tenant SaaS with hundreds of businesses, running hundreds of headless Chrome sessions is unstable and resource-prohibitive.
  - **Meta Cloud API** scales seamlessly, receiving incoming messages via HTTPS Webhooks and sending replies through official Graph API endpoints with zero local browser overhead.
- **Embedded Signup:** Businesses connect their WhatsApp Business account directly through Meta's Embedded Signup dialog on the TeleMind dashboard.

### Telegram: Multi-Bot Token Integration
- Businesses create their own bot via `@BotFather` and enter their `botToken` in their TeleMind dashboard settings.
- TeleMind manages active webhook routes (`/api/v1/telegram/webhook/:botToken`) per organization.

### Dual AI Engine
- **Primary Chat & Reasoning:** **Groq 120B** (`openai/gpt-oss-120b`) for sub-second responses and high reasoning capacity.
- **Secondary / Fallback & Embeddings:** **Google Gemini** (`gemini-3.5-flash` and `text-embedding-004`).

---

## 4. Prisma Database Schema Blueprint

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

enum Role {
  OWNER
  ADMIN
  AGENT
}

enum PlanTier {
  FREE
  PRO
  ENTERPRISE
}

enum ConversationStatus {
  AI_ACTIVE
  PAUSED_FOR_HUMAN
  RESOLVED
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

model Organization {
  id              String         @id @default(uuid())
  name            String
  slug            String         @unique
  plan            PlanTier       @default(FREE)
  stripeCustomerId String?
  stripeSubId     String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  memberships     Membership[]
  integrations    Integration[]
  botSettings     BotSettings?
  documents       Document[]
  documentChunks  DocumentChunk[]
  conversations   Conversation[]
  usageRecords    UsageRecord[]
}

model User {
  id            String        @id @default(uuid())
  email         String        @unique
  passwordHash  String
  fullName      String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  memberships   Membership[]
}

model Membership {
  id              String        @id @default(uuid())
  role            Role          @default(AGENT)
  userId          String
  organizationId  String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
}

model Integration {
  id              String        @id @default(uuid())
  organizationId  String
  channel         String        // "WHATSAPP_CLOUD" | "TELEGRAM"
  // For WhatsApp Cloud API:
  phoneNumberId   String?       @unique
  wabaId          String?       // WhatsApp Business Account ID
  accessTokenEnc  String?       // Encrypted Meta System User Token
  // For Telegram:
  telegramBotToken String?
  
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  conversations   Conversation[]
}

model BotSettings {
  id              String        @id @default(uuid())
  organizationId  String        @unique
  systemPrompt    String        @default("You are a helpful customer assistant.")
  temperature     Float         @default(0.7)
  businessHoursStart String?    // e.g. "09:00"
  businessHoursEnd   String?    // e.g. "18:00"
  timezone        String        @default("UTC")
  outOfHoursMessage String?
  autoHandoffKeywords String[]  @default(["agent", "human", "support", "help"])

  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}

model Document {
  id              String         @id @default(uuid())
  organizationId  String
  title           String
  fileName        String
  fileSize        Int
  mimeType        String
  totalChunks     Int            @default(0)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  organization    Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  chunks          DocumentChunk[]
}

model DocumentChunk {
  id              String                     @id @default(uuid())
  organizationId  String
  documentId      String
  chunkIndex      Int
  content         String
  embedding       Unsupported("vector(768)")?
  createdAt       DateTime                   @default(now())

  organization    Organization               @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  document        Document                   @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([organizationId])
}

model Conversation {
  id              String             @id @default(uuid())
  organizationId  String
  integrationId   String
  customerPhone   String             // WhatsApp phone or Telegram Chat ID
  customerName    String?
  status          ConversationStatus @default(AI_ACTIVE)
  assignedTo      String?            // User ID of human agent if taken over
  lastMessageAt   DateTime           @default(now())
  createdAt       DateTime           @default(now())

  organization    Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  integration     Integration        @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  messages        Message[]

  @@unique([organizationId, customerPhone])
}

model Message {
  id              String           @id @default(uuid())
  conversationId  String
  direction       MessageDirection // INBOUND (Customer) or OUTBOUND (Bot / Human Agent)
  senderType      String           // "CUSTOMER" | "BOT" | "HUMAN_AGENT"
  content         String
  providerMsgId   String?          // Meta wamid or Telegram msgId
  createdAt       DateTime         @default(now())

  conversation    Conversation     @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}

model UsageRecord {
  id              String        @id @default(uuid())
  organizationId  String
  billingMonth    String        // "2026-11"
  messagesCount   Int           @default(0)
  tokensUsed      Int           @default(0)
  documentsCount  Int           @default(0)
  updatedAt       DateTime      @updatedAt

  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, billingMonth])
}
```

---

## 5. Phased Implementation Roadmap

### Phase 1: SaaS Foundation & Multi-Tenancy
* **Goal:** Migrate database to multi-tenant schema and establish JWT authentication with workspace isolation.
* **Deliverables:**
  1. Push new multi-tenant `prisma/schema.prisma` with `db push` or migrations.
  2. Implement `AuthModule`:
     - `POST /api/v1/auth/signup`: Registers `User`, creates default `Organization`, links as `OWNER`.
     - `POST /api/v1/auth/login`: Validates credentials, issues JWT containing `{ userId, organizationId, role }`.
     - `POST /api/v1/auth/invite`: Owner/Admin invites new team member.
  3. Create `TenantGuard` and `@CurrentOrg()` parameter decorator to enforce workspace scoping across all API routes.
* **Verification:** An agent of Organization A attempting to read or modify Organization B’s data receives HTTP `403 Forbidden`.

---

### Phase 2: Meta WhatsApp Cloud API & Webhook Ingestion
* **Goal:** Reliable, scalable message receiving and sending without local browser sessions.
* **Deliverables:**
  1. `GET /api/v1/whatsapp/webhook`: Meta Webhook challenge-response handshake (`hub.mode`, `hub.verify_token`, `hub.challenge`).
  2. `POST /api/v1/whatsapp/webhook`:
     - Validates payload structure and maps `entry.changes.value.metadata.phone_number_id` to the matching `Integration`.
     - Enqueues inbound message into BullMQ (`whatsapp-inbound-queue`) for idempotent, non-blocking execution.
  3. Cloud API Outbound Service:
     - Sends replies via `POST https://graph.facebook.com/v21.0/{phoneNumberId}/messages`.
* **Verification:** Incoming messages to the Meta test number trigger BullMQ jobs, resolve the organization, and send automated replies.

---

### Phase 3: Tenant-Scoped RAG & Controlled AI Behavior
* **Goal:** Ensure every company’s assistant only searches and cites that company’s approved files.
* **Deliverables:**
  1. Update `rag.service.ts`:
     - Document upload and chunking saves with `organizationId`.
     - Vector similarity query filters with `WHERE "organizationId" = $1`.
  2. Prompt Builder:
     - Injects custom `BotSettings` (tone, business hours, and fallback behavior).
     - Appends source footnotes/citations to replies (e.g., `[Source: Pricing_2026.pdf]`).
  3. Out-of-Hours & Handoff detection:
     - Detects keywords (e.g., "human", "agent", "support") and flips conversation status to `PAUSED_FOR_HUMAN`.
* **Verification:** Uploading different test files to two test organizations confirms that AI answers never cross-pollinate.

---

### Phase 4: Next.js Team Dashboard & Human Takeover Console
* **Goal:** A modern web UI for business owners and support staff.
* **Tech Stack:** Next.js 15 (App Router), Tailwind CSS, Shadcn UI, TanStack Query, Lucide Icons.
* **Core Screens:**
  1. **Workspace Switcher & Team Settings:** Invite agents, assign roles.
  2. **Channel Connectors:**
     - WhatsApp: Input Phone ID, WABA ID, and Permanent Access Token (or Embedded Signup).
     - Telegram: Input Bot Token.
  3. **Knowledge Base:** Drag-and-drop PDF/DOCX uploader with live chunking counts and indexing progress.
  4. **Live Team Inbox:**
     - Left pane: Active conversations list with badges (`AI Active`, `Needs Human`, `Resolved`).
     - Center pane: Real-time message thread.
     - Action toolbar: **"Pause AI / Takeover"** button allowing human agents to type and send replies directly to customer WhatsApp/Telegram.
  5. **Bot Persona Studio:** System prompt customization, business hours config, and test playground.

---

### Phase 5: Stripe Billing, Metering & Observability
* **Goal:** Commercial monetization and production-grade monitoring.
* **Deliverables:**
  1. **Stripe Integration:**
     - Customer creation on workspace registration.
     - Checkout sessions for Free / Pro / Enterprise tiers.
     - Webhook handler (`POST /api/v1/billing/webhook`) for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
  2. **Usage Guards:**
     - Track monthly message count in `UsageRecord`.
     - Soft/hard limits (e.g., Free tier capped at 50 messages/month).
  3. **Observability:**
     - Langfuse / OpenTelemetry tracing for prompt-to-response latency, token counts, and cost calculation.
     - Prometheus metrics exposed at `/metrics`.

---

## 6. Pre-requisites Checklist

| Resource | Purpose | Setup Link / Details | Cost |
| :--- | :--- | :--- | :---: |
| **Meta for Developers** | WhatsApp Cloud API, Webhooks, Test Numbers | [developers.facebook.com](https://developers.facebook.com/) | Free |
| **Groq API Key** | Primary ultra-fast chat completion (120B) | [console.groq.com](https://console.groq.com/) | Free tier |
| **Google Gemini Key** | Embeddings (`text-embedding-004`) & Fallback | [aistudio.google.com](https://aistudio.google.com/) | Free tier |
| **Stripe Account** | Billing checkout & Webhook testing | [dashboard.stripe.com](https://dashboard.stripe.com/) | Free (Test Mode) |
| **PostgreSQL + Redis** | Relational data, pgvector, and BullMQ | Local Docker or AWS EC2 | Free / Existing |

---

## 7. Immediate Next Step

Proceed to **Phase 1: SaaS Foundation & Multi-Tenancy**:
1. Update [prisma/schema.prisma](file:///d:/TeleMind/prisma/schema.prisma) with the new multi-tenant models (`Organization`, `User`, `Membership`, `Integration`, `BotSettings`, `Conversation`, `Message`, and `UsageRecord`).
2. Run `pnpm prisma db push` to synchronize PostgreSQL.
3. Build the core `AuthModule` (signup, login, and JWT `TenantGuard`).
