# @telemind/logger

High-performance structured logger built on top of Pino for TeleMind.

## Features
- Structured JSON output in production for Logstash / Datadog / OpenTelemetry ingestion.
- Colorized pretty-printing in local development mode.
- Contextual metadata attachment (e.g., `traceId`, `userId`, `telegramChatId`).
- Automatic redaction of sensitive credentials (`password`, `token`, `authorization`).
