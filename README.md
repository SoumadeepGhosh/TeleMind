# TeleMind 🧠

```text
  _______   _       __  __ _           _ 
 |__   __| | |     |  \/  (_)         | |
    | | ___| | ___ | \  / |_ _ __   __| |
    | |/ _ \ |/ _ \| |\/| | | '_ \ / _` |
    | |  __/ |  __/| |  | | | | | | (_| |
    |_|\___|_|\___||_|  |_|_|_| |_|\__,_|
```

> **Soumadeep AI — Multi-Platform AI Knowledge Assistant (Telegram & WhatsApp)**  
> *Built with NestJS, TypeScript, PostgreSQL (pgvector), Redis, BullMQ, Groq AI (120B), Google Gemini, and Whisper Voice AI.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange.svg)](https://pnpm.io/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com/)
[![Groq](https://img.shields.io/badge/Groq-120B%20Llama%2FOSS-purple.svg)](https://groq.com/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Web.js-green.svg)](https://wwebjs.dev/)
[![Telegram Bot](https://img.shields.io/badge/Telegram-@telemind__test__bot-2CA5E0?logo=telegram&logoColor=white)](https://t.me/telemind_test_bot)

> 🤖 **Telegram Bot Link**: [https://t.me/telemind_test_bot](https://t.me/telemind_test_bot) (`@telemind_test_bot`)

---

## 📖 Overview

**TeleMind** (featuring **Soumadeep AI**) is a production-grade conversational knowledge assistant that connects to both **Telegram** and **WhatsApp**. It transforms private documents, PDFs, and notes into an instant contextual knowledge base, handles real-time natural language chat, and provides full bidirectional voice interactions (speech-to-text and text-to-speech).

### 🌟 Key Highlights

- **⚡ Dual AI Engine with Smart Fallback**:
  - **Primary**: **Groq AI (`openai/gpt-oss-120b`)** — 120-Billion parameter reasoning model with up to 14,400 free requests/day and ultra-fast inference speed.
  - **Secondary / Embeddings**: **Google Gemini (`gemini-3.5-flash` / `text-embedding-004`)** for dense 768-dimensional vector representations.
  - **Temporal Awareness**: Injects live dynamic dates (`Current Date: Monday, November 16, 2026`) so the assistant always understands current events and relative timelines.

- **📱 Multi-Platform Support**:
  - **Telegram Bot**: Polling bot built with Telegraf, handling text commands, interactive buttons, document uploads, and audio notes.
  - **WhatsApp Integration**: Built with `whatsapp-web.js` + LocalAuth persistent session:
    - **Self-Chat ("Message Yourself")**: Full support for personal notes and queries in your own WhatsApp chat without needing a second phone.
    - **Strict Group Protection**: All `@g.us` group messages are automatically ignored to protect user privacy.
    - **Trigger Prefix**: Responds in individual chats only when explicitly addressed with `@ai` or `!ask` commands.

- **🎙️ Full Speech & Audio Pipeline**:
  - **Voice Input (STT)**: Transcribes incoming Telegram voice notes and WhatsApp audio/PTT messages using **Groq Whisper (`whisper-large-v3-turbo`)**.
  - **Voice Output (TTS)**: Automatically synthesizes and responds with playable voice notes using **Google Text-to-Speech (`google-tts-api`)**.

- **📚 RAG & Vector Knowledge Base**:
  - **PostgreSQL 16 + pgvector**: Stores document chunks and 768-dimensional vector embeddings with cosine similarity search.
  - **Chunking Pipeline**: Sliding-window chunker with 150-character overlap for optimal document context preservation.
  - **Supported Documents**: PDF, Plain Text, and Markdown.

- **⚙️ Asynchronous BullMQ Queue & Visual Dashboard**:
  - Background document indexing jobs (`document-indexing`) powered by **BullMQ** and **Redis**.
  - **Live Bull-Board Dashboard**: Inspect queues, job statuses, and retry failed tasks in your browser at `http://localhost:3060/admin/queues`.

- **🚀 PM2 Production Daemon**:
  - Ready for continuous background execution on Windows/Linux with auto-restart on reboot.

---

## 🤖 Available Bot Commands

### Telegram Commands (Bot: [@telemind_test_bot](https://t.me/telemind_test_bot))
| Command | Description |
|---|---|
| `/start` | Launch the assistant and see introductory guide |
| `/ask <question>` | Query the uploaded document knowledge base with vector similarity search |
| `/listdocs` | View all indexed documents with IDs, chunk counts, and timestamps |
| `/deletedoc <doc_id>` | Permanently remove a document and its vector embeddings from the database |
| `/clear` | Clear your active conversational memory / chat history |
| `/help` | Display interactive command help and usage tips |
| *Send PDF/Doc* | Automatically enqueues the document for background RAG indexing via BullMQ |
| *Send Voice Note* | Transcribes voice note with Groq Whisper and responds back in voice + text |

### WhatsApp Triggers
| Trigger | Description |
|---|---|
| `@ai <question>` | Ask the AI any general knowledge or technical question |
| `!ask <question>` | Query your indexed documents using vector similarity |
| `!listdocs` | List all indexed documents in the database |
| `!clear` | Clear your WhatsApp conversation memory |
| `!help` | Show WhatsApp usage instructions |
| *Voice Notes* | Send a voice note with `@ai` to get a voice response |

---

## 📂 Project Architecture

```text
telemind/
│
├── src/
│   ├── modules/
│   │   ├── ai/             # Groq 120B, Gemini Flash, Whisper STT & TTS
│   │   ├── telegram/       # Telegraf bot handlers, commands & voice processing
│   │   ├── whatsapp/       # WhatsApp-Web.js client, LocalAuth & message filter
│   │   ├── rag/            # Document parsing, chunking & pgvector similarity search
│   │   ├── queue/          # BullMQ queue definition & DocumentProcessor worker
│   │   ├── database/       # PrismaService & PostgreSQL connection
│   │   └── auth/           # User authentication & JWT guards
│   │
│   ├── common/             # Shared helpers, decorators, errors, types
│   ├── config/             # Strongly-typed environment configuration
│   │
│   ├── app.module.ts       # Root NestJS module connecting all features
│   └── main.ts             # Application entrypoint (starts REST API & Bots)
│
├── prisma/
│   └── schema.prisma       # Database schema (PostgreSQL + pgvector)
│
├── docker/                 # PostgreSQL pgvector init scripts
├── docker-compose.yml      # Local infrastructure: PostgreSQL (pgvector) + Redis
├── ecosystem.config.js     # PM2 production process configuration
├── package.json            # Manifest & dependencies
├── tsconfig.json           # Strict TypeScript configuration
└── .env                    # Local environment variables
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Docker & Docker Compose** (for PostgreSQL & Redis)
- **Google Chrome** (for WhatsApp Web automation)

### 2. Environment Configuration
Create a `.env` file in the project root:

```env
PORT=3060
NODE_ENV=development

# Database (PostgreSQL + pgvector)
POSTGRES_USER=telemind_admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=telemind
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public

# Redis & BullMQ
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/0

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# AI Providers
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash

# Security
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Start Infrastructure
Start PostgreSQL (with `pgvector`) and Redis:

```bash
docker compose up -d postgres redis
```

### 4. Database Setup
Push schema and create tables:

```bash
pnpm run db:push
```

### 5. Build Application
Compile TypeScript into production JavaScript:

```bash
pnpm run build
```

### 6. Run with PM2 (Production Daemon)
Start and manage TeleMind as a background service:

```bash
# Start the process
pm2 start dist/main.js --name soumadeep-ai

# View real-time logs
pm2 logs soumadeep-ai

# Restart process
pm2 restart soumadeep-ai

# Save PM2 process list on system boot
pm2 save
```

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Framework** | [NestJS 10](https://nestjs.com/) (TypeScript) |
| **Primary LLM** | [Groq](https://groq.com/) (`openai/gpt-oss-120b` - 120B parameters) |
| **Secondary LLM & Embeddings** | [Google Gemini](https://ai.google.dev/) (`gemini-3.5-flash`, `text-embedding-004`) |
| **Speech-to-Text (STT)** | Groq Whisper (`whisper-large-v3-turbo`) |
| **Text-to-Speech (TTS)** | `google-tts-api` |
| **Vector Database** | [PostgreSQL 16](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector) |
| **ORM** | [Prisma ORM](https://www.prisma.io/) |
| **Job Queue** | [BullMQ](https://bullmq.io/) with [Redis 7](https://redis.io/) |
| **Telegram Client** | [Telegraf](https://telegraf.js.org/) |
| **WhatsApp Client** | [whatsapp-web.js](https://wwebjs.dev/) + Puppeteer Chrome |
| **Process Manager** | [PM2](https://pm2.keymetrics.io/) |

---

## 📄 License

This project is licensed under the **MIT License**.
