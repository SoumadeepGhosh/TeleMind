# ADR 0005: Standardize on Google Gemini AI Models

- **Status**: Accepted
- **Date**: 2026-11-13
- **Deciders**: Senior Staff Software Engineer, Solution Architect

---

## Context
TeleMind requires both high-quality conversational generative capabilities and efficient, dense vector representations for documents. We evaluated OpenAI (GPT-4o, text-embedding-3), Anthropic (Claude 3.5 Sonnet), and Google Gemini (1.5 Pro, 1.5 Flash, text-embedding-004).

## Decision
We select **Google Gemini AI** as the primary AI engine:
- **Gemini 1.5 Flash**: Default model for conversational chat, quick summaries, and routing due to ultra-low latency and cost-efficiency.
- **Gemini 1.5 Pro**: Used for deep synthesis across long documents and complex multi-document reasoning.
- **Gemini text-embedding-004**: High-accuracy 768-dimensional embeddings ideal for semantic search in pgvector.

## Consequences
### Positive
- Large native context windows (up to 1M–2M tokens) minimize context overflow issues.
- Competitive pricing and high throughput.
- Official `@google/genai` TypeScript SDK support.
- Native multimodal roadmap (audio, images) fits future Telegram voice and document capabilities.

### Negative / Trade-offs
- Vendor dependency on Google AI Studio / Google Cloud Vertex AI (mitigated via modular abstraction in `packages/ai`).
