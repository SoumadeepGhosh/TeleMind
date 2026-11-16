# TeleMind - Architecture Decision Log

This document records high-impact architectural and technical decisions made for TeleMind. We use the **Architecture Decision Record (ADR)** format following Michael Nygard's standard template.

---

## Architecture Decision Records Index

| ADR ID                                                | Title                                          | Status   | Date       | Decision Summary                                                       |
| ----------------------------------------------------- | ---------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------- |
| [ADR-0001](ADR/0001-record-architecture-decisions.md) | Record Architecture Decisions                  | Accepted | 2026-11-13 | Adopt ADR process for tracking major architectural changes.            |
| [ADR-0002](ADR/0002-modular-monorepo-pnpm.md)         | Adopt Modular Monorepo with pnpm Workspaces    | Accepted | 2026-11-13 | Manage apps and packages in a unified monorepo using pnpm.             |
| [ADR-0003](ADR/0003-postgresql-with-pgvector.md)      | Use PostgreSQL with pgvector for Vector Search | Accepted | 2026-11-13 | Consolidate transactional and vector data in PostgreSQL with pgvector. |
| [ADR-0004](ADR/0004-bullmq-for-asynchronous-jobs.md)  | BullMQ and Redis for Decoupled Job Queues      | Accepted | 2026-11-13 | Process Telegram updates and RAG pipelines via BullMQ queues.          |
| [ADR-0005](ADR/0005-google-gemini-ai-provider.md)     | Standardize on Google Gemini AI Models         | Accepted | 2026-11-13 | Use Gemini 1.5 Pro, Flash, and `text-embedding-004` for inference.     |

---

## How to Propose a New Decision

1. Copy the template from [ADR-0001](ADR/0001-record-architecture-decisions.md).
2. Assign the next sequential number (e.g. `0006-descriptive-title.md`) inside `docs/ADR/`.
3. Fill out the Context, Decision, and Consequences sections.
4. Submit a Pull Request with the `architecture` label.
5. Review and merge following consensus from Staff/Lead Engineers.
