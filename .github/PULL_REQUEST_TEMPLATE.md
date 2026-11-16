## Description

Please include a summary of the change and which issue it fixes. Also list any dependencies that are required for this change.

Fixes # (issue)

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactor / Performance Improvement
- [ ] Documentation update
- [ ] CI/CD or Infrastructure change

## Affected Components

- [ ] `apps/api` (NestJS REST API)
- [ ] `apps/worker` (BullMQ Worker)
- [ ] `apps/dashboard` (Next.js Web Admin)
- [ ] `packages/ai` (Gemini AI SDK integration)
- [ ] `packages/rag` (pgvector & chunking pipeline)
- [ ] `packages/telegram` (Bot handlers & updates)
- [ ] `packages/database` (Prisma schema & migrations)
- [ ] `packages/shared` / `config` / `logger`

## Checklist

- [ ] My code follows the project's [Coding Guidelines](docs/CODING_GUIDELINES.md).
- [ ] I have performed a self-review of my own code.
- [ ] I have commented hard-to-understand areas.
- [ ] I have made corresponding changes to the documentation.
- [ ] My changes generate no new warnings.
- [ ] I have added tests that prove my fix is effective or that my feature works.
- [ ] New and existing unit tests pass locally with my changes.
- [ ] Any dependent changes have been merged and published in downstream modules.
