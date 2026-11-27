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

## 7. Initial Implementation Target (historical)

The first implementation target was **Phase 1: SaaS Foundation & Multi-Tenancy**:
1. Update [prisma/schema.prisma](file:///d:/TeleMind/prisma/schema.prisma) with the new multi-tenant models (`Organization`, `User`, `Membership`, `Integration`, `BotSettings`, `Conversation`, `Message`, and `UsageRecord`).
2. Run `pnpm prisma db push` to synchronize PostgreSQL.
3. Build the core `AuthModule` (signup, login, and JWT `TenantGuard`).

## V2 implementation status

The first backend foundation is now in the repository:

- `POST /api/v1/auth/register` creates a user, a workspace, and an owner membership.
- `POST /api/v1/auth/login` returns a signed bearer token.
- `GET /api/v1/auth/me` returns the authenticated user's workspace and role.
- `GET /api/v1/knowledge/documents`, `POST /api/v1/knowledge/notes`, `POST /api/v1/knowledge/ask`, and `DELETE /api/v1/knowledge/documents/:id` are JWT-protected and scoped to the token's workspace.
- New documents can be associated with a workspace; existing documents remain unassigned until deliberately migrated.

The schema validates and the NestJS app compiles. On 2026-11-26, the migrations and auth/knowledge service flows were smoke-checked against a separate temporary local database, including cross-workspace listing, search, and deletion isolation. No migration was applied to the existing local database or the remote database configured in `.env`. Legacy Telegram and WhatsApp bot handlers still use shared/global document operations and must be isolated or disabled before serving multiple customer workspaces.

The initial dashboard milestone has since been started. See the delivery status and remaining plan below for the current sequence.

## Delivery status and remaining plan (reviewed 2026-11-26)

Treat this section as the source of truth for delivery status. The roadmap above describes the target product; it does not mean those features are already available.

### Delivered foundation

- Database migration and Prisma models for organizations, memberships, and optional document workspace ownership.
- Registration, login, profile, organization listing/creation/switching, and organization rename endpoints.
- JWT-protected knowledge list, note indexing, ask, and delete endpoints scoped to the active workspace.
- JWT-protected PDF and text-file upload and indexing for workspace knowledge (PDF, TXT, MD, CSV, JSON; 10 MB file limit and 100,000 extracted-character limit).
- Per-workspace Telegram bot connections with encrypted token storage, workspace-scoped message handling, and a single-owner WhatsApp demo QR session.
- API & Integrations dashboard with a live knowledge query tester and route reference.
- Initial Next.js dashboard for login, knowledge notes, workspace selection, and model choice for dashboard queries.

### In progress: close Phase 1 and make the dashboard reliable

1. **Correctness and security:** prevent unscoped legacy bot access from being mistaken for tenant-safe service; verify upload, search, and delete isolation across workspaces; complete async indexing and authorization checks.
2. **Knowledge workflow:** file upload is available for PDF, TXT, MD, CSV, and JSON with size/type/extracted-text validation and synchronous indexing. Background progress, persisted error states, and retry behavior remain to be implemented.
3. **Dashboard truthfulness:** remove sample metrics and fake channel/member states. Display unavailable capabilities explicitly until backed by APIs.
4. **Team access:** implement invitations, role changes, and member removal with owner/admin authorization before displaying a team-management workflow.
5. **Settings:** persist workspace bot persona and operational settings in the database and apply them to responses; distinguish browser-only preferences from workspace configuration.

**Phase 1 exit criteria:** schema migration applies cleanly; registration/login and workspace switching work; a user can only read, create, search, and delete documents in their active workspace; automated checks cover cross-tenant and role boundaries; dashboard shows only server-backed state.

### Planned phases after Phase 1

| Order | Phase | Scope | Exit criteria |
|---|---|---|---|
| 2 | Production WhatsApp integration | Replace the single-session WhatsApp Web demo with per-workspace Meta WhatsApp Cloud API onboarding, webhook verification/signature validation, idempotent inbound queue, tenant routing, and outbound replies. | Two workspaces can connect separate official WhatsApp channels without shared credentials or data. |
| 3 | Conversations and handoff | Persist inbound/outbound messages, conversation status, assignment, business hours, human takeover, and audit events. | Human agents can safely take over, reply, resume AI, and resolve a conversation. |
| 4 | Team dashboard | Live inbox, channel management, knowledge upload progress, persisted persona settings, and team administration. | UI actions map to protected APIs and report real server state. |
| 5 | Billing and operations | Stripe subscription lifecycle, usage metering/limits, structured logs, tracing, metrics, deployment and backup guidance. | Subscription and usage state are reconciled from verified webhooks; service health is observable. |

### Dependencies and release gates

- **Before any multi-customer production deployment:** replace the one-workspace WhatsApp demo with official per-workspace Cloud API channels; rotate secrets that have ever been committed or exposed; use production-grade JWT and encryption key storage; configure HTTPS, webhook signature checks, rate limits, and database backups. Run Telegram polling in one backend process per configured bot.
- **External setup needed for channel and billing phases:** Meta developer app and test business number, public HTTPS webhook URL, Telegram bot token(s), and Stripe test account/webhook secret. These are integration inputs, not code already present.
- **Release sequence:** local migration and API checks → tenant-isolation review → channel provider sandbox → end-to-end workspace tests → production secrets and backup setup → limited rollout.

### Current implementation caveats

- Workspace membership endpoints exist, but membership invitations and role administration do not.
- Notes and supported files can be indexed through the API and dashboard. Upload runs synchronously; there is no background progress, persisted failure state, or retry action yet. Scanned PDFs need OCR and are not supported.
- AI model choice is a browser preference for the dashboard query only. Workspace persona, business hours, and temperature settings are not available yet.
- Telegram bot tokens are encrypted using `DATA_ENCRYPTION_KEY` (or the JWT secret as a development fallback); keep the encryption key stable so stored tokens can be decrypted after restarts. Telegram uses long polling, so do not run multiple backend replicas polling the same bot.
- WhatsApp is a single shared demo session claimed by one workspace at a time. It uses the WhatsApp Web QR flow and is not the production Meta WhatsApp Cloud API integration. Keep `.wwebjs_auth` on persistent storage, and do not deploy multiple WhatsApp scanner processes against it.
- Apply the workspace integrations migration with `pnpm prisma migrate deploy` before starting the updated backend. Remove any old `TELEGRAM_BOT_TOKEN` from `.env` and enter each workspace's token in Dashboard > Telegram & WhatsApp.
- For an existing Supabase database with no Prisma migration history (`P3005`), first verify its current tables match `20261117092847_superbase_migration`, then baseline that migration with `pnpm prisma migrate resolve --applied 20261117092847_superbase_migration` and run `pnpm prisma migrate deploy`. If later migrations were previously applied with `db push`, compare their full schema effects before marking them as applied; do not resolve the newest migration blindly.
- There is no conversation inbox, persisted human handoff, billing, usage enforcement, or observability pipeline yet.
- Do not claim production readiness until the Phase 1 exit criteria and pre-deployment gates above are satisfied.
