# Changelog

All notable changes to the **TeleMind** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Complete implementation of NestJS REST API Gateway.
- Complete BullMQ queue processing in background worker.
- Document parsing and pgvector similarity search integration.
- Next.js Web Admin dashboard for knowledge base management.

---

## [0.1.0-alpha.0] - 2026-11-13

### Added
- Enterprise monorepo scaffolding using `pnpm` workspaces (`apps/`, `packages/`, `docs/`, `docker/`, `scripts/`).
- Deployable app shells: `@telemind/api` (NestJS API), `@telemind/worker` (BullMQ), `@telemind/dashboard` (Next.js 14).
- Shared package shells: `@telemind/database` (Prisma + pgvector), `@telemind/ai` (Gemini), `@telemind/telegram` (Telegraf), `@telemind/rag` (RAG Engine), `@telemind/shared`, `@telemind/config`, `@telemind/logger`.
- Complete Prisma schema with PostgreSQL extensions (`vector`, `uuid-ossp`, `pg_trgm`).
- Multi-stage production Dockerfiles (`Dockerfile.api`, `Dockerfile.worker`, `Dockerfile.dashboard`) and Nginx reverse proxy configuration.
- Root `docker-compose.yml` with PostgreSQL 16 + pgvector and Redis 7.
- Complete technical documentation suite:
  - `PRD.md` (Product Requirements Document)
  - `ARCHITECTURE.md` (Detailed system architecture with Mermaid sequence and flow diagrams)
  - `DATABASE.md` (Database dictionary, ER diagram, pgvector indexes)
  - `API.md` (REST API contracts, error envelope format)
  - `ROADMAP.md` (Phases 0 through 10 with milestones and timelines)
  - `TASKS.md` (Engineering backlog with checklists)
  - `DECISIONS.md` & `ADR/` (ADR 0001 through 0005)
  - `SECURITY.md` (JWT, RBAC, input sanitization, rate limiting, SQL injection defense)
  - `DEPLOYMENT.md` (VPS, Docker, SSL, CI/CD, backup runbooks)
  - `CONTRIBUTING.md` (Branching, Conventional Commits, PR review)
  - `CODING_GUIDELINES.md` (TypeScript style guide, error handling, logging)
  - `TESTING.md` (Testing pyramid, coverage goals, Testcontainers strategy)
- GitHub issue templates (`bug_report.md`, `feature_request.md`), PR template, and GitHub Actions CI workflow.
- VS Code workspace configurations (`settings.json`, `extensions.json`, `launch.json`).
- Shell setup scripts for Linux/macOS (`scripts/setup.sh`) and Windows (`scripts/setup.ps1`).
