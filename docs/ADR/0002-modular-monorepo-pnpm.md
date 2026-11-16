# ADR 0002: Adopt Modular Monorepo with pnpm Workspaces

- **Status**: Accepted
- **Date**: 2026-11-13
- **Deciders**: Senior Staff Software Engineer, Solution Architect

---

## Context

TeleMind comprises multiple runtimes: an ingress API (`apps/api`), a background worker (`apps/worker`), and a web admin dashboard (`apps/dashboard`). These runtimes share extensive domain logic, database models, configuration schemas, logger implementations, and AI interfaces. Maintaining multiple independent repositories would cause version drift and complex release orchestration.

## Decision

We will use a modular monorepo managed via `pnpm` workspaces:

- `apps/` contains deployable service targets.
- `packages/` contains shared internal modules (`database`, `ai`, `telegram`, `rag`, `shared`, `config`, `logger`).
- Strict boundaries enforced through TypeScript project references and workspace protocol (`workspace:*`).

## Consequences

### Positive

- Atomic commits spanning shared packages and deployable services.
- Fast, deduplicated dependency installation with hard links via `pnpm`.
- Consistent TypeScript configurations and linting standards across all components.

### Negative / Trade-offs

- CI pipeline builds multiple packages (mitigated with concurrency and caching).
