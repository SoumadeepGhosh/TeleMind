# @telemind/ai

Google Gemini AI integration package providing unified interfaces for LLM inference, function calling, and vector embeddings.

## Key Capabilities
- Text generation via Gemini 1.5 Pro / Flash.
- Embedding generation using `text-embedding-004` (768 dimensions).
- Streaming response generation support.
- Retry mechanisms with exponential backoff on rate limits (HTTP 429).
- Token usage tracking and telemetry.
