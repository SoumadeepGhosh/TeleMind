# TeleMind - Contributor Guide

Thank you for your interest in contributing to **TeleMind**! We adhere to enterprise-level software engineering practices to ensure reliability, security, and long-term maintainability.

---

## 1. Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and constructive in all discussions, issues, and code reviews.

---

## 2. Branch Naming Conventions

All branches must branch off `develop` (or `main` for critical production hotfixes) and follow this naming format:

```text
<type>/<issue-number>-<short-description>
```

### Allowed Types

- `feat/`: A new user-facing feature or API capability (e.g., `feat/12-rag-chunking`).
- `fix/`: A bug fix (e.g., `fix/45-webhook-signature-check`).
- `refactor/`: Code reorganization without functional changes (e.g., `refactor/88-logger-service`).
- `perf/`: Performance optimizations (e.g., `perf/102-hnsw-index-tuning`).
- `docs/`: Documentation additions or corrections (e.g., `docs/04-api-spec`).
- `test/`: Adding or improving tests (e.g., `test/33-gemini-mocks`).
- `chore/`: Build configuration, dependency bumps, or toolchain changes (e.g., `chore/bump-pnpm`).

---

## 3. Commit Message Conventions (Conventional Commits)

Commit messages must strictly follow the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

```text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Examples

- `feat(rag): add recursive semantic chunker with configurable token overlap`
- `fix(telegram): escape markdown v2 reserved characters in assistant output`
- `perf(database): create hnsw index on document_chunks embedding column`
- `docs(api): document search endpoint request and response payload schema`

---

## 4. Local Development Workflow

1. Fork and clone the repository.
2. Ensure you have **Node.js >= 20.0.0** and **pnpm >= 9.0.0** installed.
3. Copy `.env.example` to `.env` and set local variables.
4. Run `./scripts/setup.sh` (or `.\scripts\setup.ps1` on Windows) to install dependencies and spin up Docker containers.
5. Apply database migrations: `pnpm run db:migrate:dev`.
6. Start dev processes: `pnpm run dev`.

---

## 5. Pull Request (PR) Process

1. **Verify Quality Locally**:
   - `pnpm run lint` (must pass with 0 errors).
   - `pnpm run format:check` (must pass formatting checks).
   - `pnpm run test` (all unit and integration tests must pass).
   - `pnpm run build` (entire monorepo must compile with zero errors).
2. **Submit PR**: Open a Pull Request targeting the `develop` branch using the provided [Pull Request Template](../.github/PULL_REQUEST_TEMPLATE.md).
3. **Link Issue**: Always reference the associated GitHub issue (e.g. `Fixes #42`).
4. **CI Verification**: Wait for all GitHub Actions checks to pass.

---

## 6. Code Review Standards

Every pull request requires approval from at least one core maintainer. Reviewers evaluate:

- **Architectural Alignment**: Does the code respect package boundaries and ADRs?
- **Security**: Are inputs validated? Are queries parameterized? Are secrets protected?
- **Test Coverage**: Does the PR include adequate unit and integration tests?
- **Clarity & Clean Code**: Is the code self-documenting, idiomatic TypeScript, and properly typed?
