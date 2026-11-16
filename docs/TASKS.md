# TeleMind - Engineering Task Backlog

All engineering tasks are grouped by milestone and tracked via Markdown checklists.

---

## Phase 0: Project Inception & Foundation Scaffolding

- [x] Create monorepo directory structure (`apps/`, `packages/`, `docs/`, `docker/`, `scripts/`).
- [x] Configure root `package.json`, `pnpm-workspace.yaml`, and `tsconfig.base.json`.
- [x] Generate comprehensive `.gitignore` and `LICENSE` (MIT).
- [x] Create `.env.example` with complete configuration options.
- [x] Set up root `docker-compose.yml` with PostgreSQL 16 + pgvector and Redis 7.
- [x] Create Docker build specifications (`Dockerfile.api`, `Dockerfile.worker`, `Dockerfile.dashboard`, `nginx.conf`).
- [x] Configure `.vscode/` settings, extensions, and debugging launch configs.
- [x] Create GitHub issue templates and pull request templates.
- [x] Set up GitHub Actions CI workflow for linting, typechecking, and testing.
- [x] Author core documentation suite (`PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, etc.).

---

## Phase 1: Database Architecture & pgvector Integration

- [ ] Initialize Prisma schema in `packages/database/prisma/schema.prisma`.
- [ ] Configure PostgreSQL extensions: `vector`, `uuid-ossp`, `pg_trgm`.
- [ ] Create initial migration with `prisma migrate dev`.
- [ ] Write Prisma client service wrapper with NestJS lifecycle hooks.
- [ ] Create database seeding script for default admin user and demo knowledge base.
- [ ] Write integration test verifying vector column creation and similarity query execution.

---

## Phase 2: Core API Gateway & Telegram Ingress

- [ ] Implement NestJS application bootstrap in `apps/api/src/main.ts`.
- [ ] Implement `@telemind/config` configuration module with Zod validation.
- [ ] Create Telegram webhook controller in `apps/api/src/telegram/`.
- [ ] Implement Telegram secret token validation guard.
- [ ] Set up BullMQ producer in API to push raw webhook updates to Redis.
- [ ] Implement User authentication module:
  - [ ] Password hashing with bcrypt.
  - [ ] JWT access token and refresh token generation.
  - [ ] Passport JWT strategy and authentication guards.
- [ ] Configure Swagger/OpenAPI documentation at `/api/docs`.
- [ ] Implement global exception filter adhering to RFC 7807 error format.

---

## Phase 3: BullMQ Worker & Distributed Queue Infrastructure

- [ ] Bootstrap BullMQ worker application in `apps/worker/src/main.ts`.
- [ ] Configure BullMQ processor for `telemind:telegram:ingest` queue.
- [ ] Configure processor for `telemind:rag:indexing` queue.
- [ ] Implement retry strategy: exponential backoff with max 3 attempts.
- [ ] Implement Dead Letter Queue (DLQ) logging and alerting.
- [ ] Mount Bull-Board monitoring UI at `/admin/queues` (protected by admin auth).
- [ ] Benchmark queue throughput under 1000 simulated concurrent updates.

---

## Phase 4: Google Gemini AI Integration Layer

- [ ] Initialize `@google/genai` client in `packages/ai`.
- [ ] Implement text generation wrapper with support for Gemini 1.5 Pro and Flash.
- [ ] Implement vector embedding generator using `text-embedding-004` (768 dimensions).
- [ ] Build exponential backoff handler for HTTP 429 (rate limit) responses.
- [ ] Implement token usage counter and logging.
- [ ] Write unit tests and mocks for Gemini API responses.

---

## Phase 5: RAG Ingestion & Vector Retrieval Pipeline

- [ ] Implement document text extractor in `packages/rag` (PDF, TXT, Markdown).
- [ ] Implement recursive character text chunker with configurable token size & overlap.
- [ ] Build chunk embedding worker to batch embed and persist into `document_chunks`.
- [ ] Write raw SQL vector similarity search query using `<=>` cosine distance.
- [ ] Implement prompt assembly service with context window token limits.
- [ ] Add citation tracking to map generated answers back to source chunk IDs.
- [ ] Write integration test verifying ingestion of sample PDF to answering a query.

---

## Phase 6: Telegram Bot Interactive UX & Commands

- [ ] Set up Telegraf bot instance in `packages/telegram`.
- [ ] Implement command router:
  - [ ] `/start` - Welcome message & quick onboarding.
  - [ ] `/help` - Command list & formatting instructions.
  - [ ] `/ask <query>` - Trigger RAG search & streaming reply.
  - [ ] `/index` - Prompt user for document upload.
  - [ ] `/kb` - Knowledge base selector with inline buttons.
  - [ ] `/clear` - Flush user conversation history.
- [ ] Implement typing action indicator (`sendChatAction("typing")`).
- [ ] Add support for direct file uploads in Telegram chat (auto-enqueue to RAG).
- [ ] Implement message chunking for replies exceeding Telegram's 4096-character limit.

---

## Phase 7: Web Administration Dashboard

- [ ] Bootstrap Next.js 14 project in `apps/dashboard` with Tailwind CSS.
- [ ] Build login page with JWT authentication state management.
- [ ] Build Knowledge Base view:
  - [ ] Document list with status badges (`PENDING`, `INDEXED`, `FAILED`).
  - [ ] Drag-and-drop document upload interface.
  - [ ] Chunk inspection modal showing text and metadata.
- [ ] Build User management page (invite user, change roles, deactivate).
- [ ] Build Analytics dashboard (total queries, average latency, token breakdown).

---

## Phase 8: Enterprise Security Hardening & Audit

- [ ] Configure Helmet HTTP security headers in API.
- [ ] Configure strict CORS origin whitelisting.
- [ ] Implement NestJS Throttler rate limiting (IP-based and user-based).
- [ ] Implement AuditLog entity logging for all admin mutations.
- [ ] Add file upload validation (magic byte checking, MIME type whitelisting, size limits).
- [ ] Perform SAST security audit via `pnpm audit` and Snyk.

---

## Phase 9: Production Deployment, Monitoring & CI/CD

- [ ] Finalize multi-stage Docker build containers with non-root security.
- [ ] Configure Nginx reverse proxy with SSL termination and rate limiting zones.
- [ ] Set up GitHub Actions workflow for automated container build and registry push.
- [ ] Create automated database backup script for PostgreSQL and pgdata.
- [ ] Set up Prometheus `/metrics` endpoint and Grafana monitoring dashboard.
- [ ] Perform end-to-end smoke tests on staging VPS environment.

---

## Phase 10: Multimodal AI & Advanced Capabilities

- [ ] Implement audio voice note processing (transcription via Gemini Audio).
- [ ] Support image/infographic extraction from PDF documents.
- [ ] Add conversational memory summarization for long-running chat sessions.
- [ ] Explore agentic tool calling (web search integration, calculator).
