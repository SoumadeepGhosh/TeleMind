# @telemind/api

NestJS-based REST API and Webhook gateway for TeleMind.

## Responsibilities
- Handling Telegram Webhook requests and fast ingress to Redis queues.
- Exposing REST API endpoints for user authentication, document management, and knowledge search.
- Integrating JWT guards, rate limiting, and OpenAPI/Swagger documentation.

## Planned Modules
- `AuthModule`: User registration, login, token refresh, and RBAC guards.
- `TelegramModule`: Webhook controllers, secret verification, and payload routing.
- `DocumentModule`: Multipart upload handling, document metadata tracking, and ingestion triggering.
- `ChatModule`: Chat history retrieval, session management, and manual RAG queries.
- `HealthModule`: Liveness, readiness, and system telemetry endpoints.
