# @telemind/config

Centralized strongly-typed configuration module powered by Zod schema validation.

## Features
- Validates all environment variables on application startup.
- Throws descriptive errors if any mandatory variable (e.g. `DATABASE_URL`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`) is missing or invalid.
- Exports immutable, type-safe configuration objects.
