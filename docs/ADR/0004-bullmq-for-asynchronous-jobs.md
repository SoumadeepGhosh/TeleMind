# ADR 0004: BullMQ and Redis for Decoupled Job Queues

- **Status**: Accepted
- **Date**: 2026-11-13
- **Deciders**: Senior Staff Software Engineer, Solution Architect

---

## Context

Telegram expects webhooks to respond with HTTP 200 within a few seconds. If an endpoint takes too long, Telegram marks the webhook as timed out and resends the message, resulting in severe response duplication. LLM queries, PDF parsing, and embedding generation routinely take multiple seconds.

## Decision

We will decouple ingress from processing using **BullMQ** on top of **Redis 7**:

- `apps/api` validates incoming webhooks and immediately pushes the payload to Redis queue `telemind:telegram:ingest` before returning HTTP 200.
- `apps/worker` asynchronously dequeues jobs, coordinates with the AI pipeline, and dispatches responses back via Telegram's Bot API.
- Separate queues are maintained for document indexing (`telemind:rag:indexing`) to isolate heavy background batch jobs from real-time chat.

## Consequences

### Positive

- Sub-200ms webhook response time guaranteed.
- Automatic retry on network hiccups or API rate limits with exponential backoff.
- Independent horizontal scaling of workers based on queue depth.
- Built-in job telemetry, priority scheduling, and Dead Letter Queue.

### Negative / Trade-offs

- Requires Redis infrastructure and persistence management (`appendonly yes`).
