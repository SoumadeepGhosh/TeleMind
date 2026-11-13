# @telemind/worker

Asynchronous background worker built with NestJS and BullMQ.

## Responsibilities
- Processing incoming Telegram message queues to prevent webhook timeouts.
- Ingestion and chunking of user-uploaded files (PDF, Markdown, Text).
- Vector embedding generation via Gemini Embedding API (`text-embedding-004`).
- Executing RAG retrieval pipeline and querying Gemini 1.5 Pro/Flash.
- Dispatching outbound responses back to Telegram users.
