# TeleMind - Security Policy & Hardening Guide

| **Document Version** | 1.0.0 |
| **Status** | Active Standard |
| **Classification** | Enterprise Confidential |

---

## 1. Authentication & Session Security

### 1.1 JSON Web Tokens (JWT) Architecture
- **Short-Lived Access Tokens**: Issued with an expiration of 15 minutes (`JWT_EXPIRATION=15m`).
- **Cryptographic Signature**: Signed with HMAC SHA-256 using a minimum 64-character high-entropy secret (`JWT_SECRET`).
- **Refresh Token Rotation**: Refresh tokens (`JWT_REFRESH_EXPIRATION=7d`) are stored as single-use hashes in the database. When a refresh token is used, it is revoked and replaced with a new pair.
- **Revocation**: If a token compromise is detected, users can invalidate all active sessions immediately.

### 1.2 Telegram Authentication & Webhook Verification
- Webhooks received from Telegram must contain the `X-Telegram-Bot-Api-Secret-Token` header.
- The webhook controller compares the received token against `TELEGRAM_WEBHOOK_SECRET` using a constant-time comparison algorithm (`crypto.timingSafeEqual`) to prevent timing attacks.

---

## 2. Authorization & Role-Based Access Control (RBAC)

TeleMind enforces strict RBAC across all REST and Dashboard endpoints:

| Role | Permissions |
|---|---|
| `SUPER_ADMIN` | Full system control: manages administrators, global configs, and audit logs. |
| `ADMIN` | Manages knowledge bases, uploads/deletes documents, views workspace analytics. |
| `MEMBER` | Can query knowledge bases, upload documents to their assigned group, and chat. |
| `VIEWER` | Read-only access to search and view document summaries. |

Role checking is enforced via NestJS `RolesGuard` and decorators applied to controller handlers.

---

## 3. Secrets Management

- **Zero Hardcoded Secrets**: Secrets, API keys, passwords, and tokens are never committed to version control.
- **Environment Isolation**: Production environments source configuration from secure key vaults (e.g., AWS Secrets Manager, HashiCorp Vault, or encrypted Kubernetes Secrets).
- **Redaction in Logs**: Pino logger filters out sensitive keys (`password`, `token`, `authorization`, `cookie`, `secret`, `apiKey`) before writing log records.

---

## 4. Input Validation & Data Sanitization

- **Strict DTO Validation**: All REST inputs are validated using `class-validator` and `class-transformer` inside NestJS global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
- **Runtime Schema Validation**: Configurations and internal messages validate schema definitions using `zod`.
- **Telegram Formatting Escaping**: Telegram MarkdownV2 requires escaping special characters (`_`, `*`, `[`, `]`, `(`, `)`, `~`, `` ` ``, `>`, `#`, `+`, `-`, `=`, `|`, `{`, `}`, `.`, `!`). The `@telemind/telegram` package provides dedicated escaping helpers to prevent formatting errors and injection.

---

## 5. Rate Limiting & Denial of Service (DoS) Mitigation

- **API Throttling**: Protected by `@nestjs/throttler` backed by Redis storage. Defaults:
  - Public endpoints: 30 requests / minute.
  - Authenticated endpoints: 100 requests / minute.
  - Webhook endpoint: 50 requests / second with burst tolerance.
- **Per-User Telegram Limiting**: Redis token-bucket limiter limits individual Telegram users to a maximum of 20 queries per minute to prevent LLM quota exhaustion.

---

## 6. SQL Injection Prevention

- **Parameterized Queries**: All relational data interactions use **Prisma ORM**, which generates parameterized queries by default.
- **pgvector Raw SQL Protection**: When raw SQL is required for vector cosine distance (`$queryRaw`), all arguments (including vectors and identifiers) must be passed via bound parameters (`$1`, `$2`), never string interpolation:
  ```typescript
  // SECURE
  await prisma.$queryRaw`
    SELECT id, content FROM document_chunks 
    ORDER BY embedding <=> ${queryVector}::vector 
    LIMIT ${topK}
  `;
  ```

---

## 7. Cross-Site Scripting (XSS) & HTTP Security Headers

- **Helmet**: Integrated into `apps/api` to set strict HTTP response headers:
  - `Content-Security-Policy (CSP)`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security (HSTS)`
- **Next.js Sanitization**: Dashboard UI leverages React's built-in JSX escaping. Any markdown rendered in the browser is parsed with `rehype-sanitize`.

---

## 8. File Upload Security

Documents uploaded via web or Telegram chat pass rigorous security controls before indexing:
1. **File Size Capping**: Hard limit of 25MB per file enforced at reverse proxy and application layer.
2. **MIME & Extension Whitelisting**: Allowed types strictly limited to:
   - `application/pdf` (`.pdf`)
   - `text/markdown` (`.md`)
   - `text/plain` (`.txt`)
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`)
3. **Magic Byte Verification**: File signatures are validated against binary headers, not just client-supplied MIME headers or file extensions.
4. **Isolated Storage**: Files are stored in dedicated object storage buckets or isolated container volumes with no execution permissions (`noexec`).
