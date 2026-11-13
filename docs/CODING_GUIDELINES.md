# TeleMind - Engineering & Coding Guidelines

| **Document Version** | 1.0.0 |
| **Language Target** | TypeScript 5.6+ / Node.js 20+ |
| **Status** | Mandatory Engineering Standard |

---

## 1. Monorepo Organization & Boundaries

TeleMind enforces strict encapsulation between deployable applications and internal packages:

- **Apps (`apps/*`)**: Contain runtime bootstrap, entrypoints, controllers, and wiring. They do not export code for other packages or apps.
- **Packages (`packages/*`)**: Contain domain libraries and utilities. Each package must have a single primary entry point (`src/index.ts`) defined in its `package.json`.
- **Dependency Flow**: Apps depend on packages. Packages may depend on lower-tier packages (e.g. `@telemind/rag` depends on `@telemind/ai` and `@telemind/database`), but circular dependencies between packages are strictly forbidden.

---

## 2. Naming Conventions

| Category | Convention | Example |
|---|---|---|
| **Files & Folders** | `kebab-case` | `document-chunker.service.ts`, `telegram-webhook.controller.ts` |
| **Classes & Interfaces** | `PascalCase` | `DocumentChunkerService`, `TelegramMessagePayload` |
| **Methods & Variables** | `camelCase` | `generateEmbedding()`, `activeChatSession` |
| **Constants & Enums** | `UPPER_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS`, `DocumentStatus.INDEXED` |
| **Type Aliases** | `PascalCase` | `VectorEmbedding`, `SimilaritySearchResult` |
| **Database Tables & Columns** | `snake_case` | `document_chunks`, `created_at` |

---

## 3. TypeScript Style Guide & Strictness

- **No `any`**: The use of `any` is forbidden. Use `unknown` with type guards, generic type arguments, or Zod schemas for untyped external inputs.
- **Explicit Return Types**: All exported functions, methods, and public APIs must declare explicit return types.
- **Immutability by Default**: Prefer `readonly` arrays, `as const`, and `readonly` properties where state is not meant to mutate.
- **Null vs. Undefined**:
  - Use `null` when a database column is explicitly nullable.
  - Use `undefined` for optional object properties or missing arguments.

```typescript
// GOOD
export async function findDocumentById(
  documentId: string
): Promise<DocumentEntity | null> {
  return prisma.document.findUnique({ where: { id: documentId } });
}

// BAD
export async function findDocumentById(documentId: any) {
  return await prisma.document.findUnique({ where: { id: documentId } });
}
```

---

## 4. Error Handling Principles

- **No Silent Failures**: Never write empty `catch` blocks. If an error is caught and ignored, a comment must explain why.
- **Custom Domain Exceptions**: Throw typed domain exceptions extending a base `TeleMindException` class:
  ```typescript
  export class DocumentIndexingException extends TeleMindException {
    constructor(message: string, public readonly documentId: string, cause?: Error) {
      super(message, ErrorCode.DOCUMENT_INDEXING_FAILED, 500, cause);
    }
  }
  ```
- **Error Mapping at Boundaries**: NestJS controllers must catch domain exceptions and convert them into standard RFC 7807 HTTP responses.

---

## 5. Structured Logging Guidelines

- **Use `@telemind/logger`**: Never use raw `console.log()` or `console.error()`.
- **Include Context**: Always attach contextual object metadata (e.g., `documentId`, `traceId`, `userId`, `durationMs`) as the first argument:
  ```typescript
  // GOOD
  this.logger.info(
    { documentId, chunkCount: chunks.length, durationMs },
    "Document chunking completed successfully"
  );

  // BAD
  console.log("Chunked document " + documentId);
  ```
- **Sensitive Data Scrubbing**: Never log raw passwords, authorization headers, Telegram webhook secrets, or unredacted PII.

---

## 6. Clean Code & Architectural Principles

- **Single Responsibility Principle (SRP)**: Each class or module must have one and only one reason to change. Separate chunk parsing from vector embedding generation.
- **Dependency Injection**: Use NestJS dependency injection rather than instantiating dependencies with `new`.
- **DRY (Don't Repeat Yourself)**: Shared types, validation logic, and utility functions belong in `@telemind/shared`.
- **Fail Fast**: Validate inputs at system boundaries before executing heavy operations.
