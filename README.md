# TeleMind 🧠

```text
  _______   _       __  __ _           _ 
 |__   __| | |     |  \/  (_)         | |
    | | ___| | ___ | \  / |_ _ __   __| |
    | |/ _ \ |/ _ \| |\/| | | '_ \ / _` |
    | |  __/ |  __/| |  | | | | | | (_| |
    |_|\___|_|\___||_|  |_|_|_| |_|\__,_|
```

> **Enterprise-grade, AI-Powered Telegram Knowledge Assistant**  
> *Built with NestJS, TypeScript, PostgreSQL (pgvector), Redis, BullMQ, Docker, Prisma, and Google Gemini AI.*

[![CI Pipeline](https://github.com/telemind/telemind/actions/workflows/ci.yml/badge.svg)](https://github.com/telemind/telemind/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange.svg)](https://pnpm.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

---

## 📖 Overview

**TeleMind** transforms private and organizational documentation into an instant, conversational intelligence assistant accessible directly inside Telegram or via a dedicated web dashboard.

TeleMind indexes multi-format documents (PDF, Markdown, Plain Text, Word) using **Google Gemini** embeddings and stores them in **PostgreSQL 16** with **pgvector**. Incoming queries from Telegram users are processed asynchronously via **BullMQ** job queues, performing vector similarity search to synthesize context-grounded answers with exact footnote citations—preventing hallucinations and eliminating gateway timeouts.

---

## ✨ Key Features

- 💬 **Frictionless Telegram Interface**: Instant natural language querying via commands (`/ask`, `/kb`, `/index`) or direct conversational messages.
- 📂 **In-Chat Document Ingestion**: Upload PDF, Markdown, or text files directly into Telegram or via the Admin Web Dashboard.
- ⚡ **Asynchronous Event-Driven Processing**: Built on BullMQ & Redis to guarantee sub-200ms webhook acknowledgments with zero dropped messages.
- 🔍 **Hybrid Vector Retrieval (RAG)**: Fast cosine distance (`<=>`) queries in PostgreSQL `pgvector` with HNSW indexing.
- 🤖 **Google Gemini 1.5 Pro & Flash**: State-of-the-art reasoning, large context windows, and source attribution.
- 🏢 **Multi-Tenant Knowledge Bases**: Organize knowledge into segregated knowledge bases with granular role-based access control.
- 📊 **Next.js Web Admin Dashboard**: Manage documents, inspect chunks, monitor queue metrics, and review audit logs.
- 🛡️ **Enterprise Security**: JWT auth, bcrypt password hashing, constant-time webhook verification, input sanitization, and SQL injection defenses.

---

## 🏛️ Architecture Overview

TeleMind uses a modular monorepo architecture with decoupled ingress and worker services:

```mermaid
graph TB
    subgraph Clients["Clients"]
        TG["Telegram App"]
        DASH["Web Dashboard (Next.js)"]
    end

    subgraph Edge["Ingress"]
        NGINX["Nginx SSL / Reverse Proxy"]
    end

    subgraph Core["TeleMind Microservices"]
        API["apps/api (NestJS Gateway)"]
        WORKER["apps/worker (BullMQ Worker)"]
    end

    subgraph Storage["Persistence & Cache"]
        REDIS[("Redis 7 (Queues & Cache)")]
        POSTGRES[("PostgreSQL 16 + pgvector")]
    end

    subgraph AI["AI Layer"]
        GEMINI["Google Gemini AI (1.5 Pro / Embeddings)"]
    end

    TG -->|Webhook Update| NGINX
    DASH -->|REST API| NGINX
    NGINX --> API

    API -->|Enqueue Update (Fast Ingress)| REDIS
    API -->|Metadata / Auth| POSTGRES

    WORKER -->|Consume Jobs| REDIS
    WORKER -->|Vector Similarity Query| POSTGRES
    WORKER -->|Generate Embedding & Synthesis| GEMINI
    WORKER -->|Outbound Reply (HTTPS)| TG
```

For full architectural diagrams, request lifecycles, and sequence flows, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Backend Framework** | [NestJS](https://nestjs.com/) (Modular Architecture) |
| **Language & Runtime** | [TypeScript 5.6+](https://www.typescriptlang.org/), [Node.js 20 LTS](https://nodejs.org/) |
| **Package Manager** | [pnpm](https://pnpm.io/) (Workspaces Monorepo) |
| **Relational & Vector DB** | [PostgreSQL 16](https://www.postgresql.org/) with [`pgvector`](https://github.com/pgvector/pgvector) |
| **ORM & Migrations** | [Prisma ORM](https://www.prisma.io/) |
| **Job Queue & Cache** | [Redis 7](https://redis.io/), [BullMQ](https://bullmq.io/) |
| **AI Models & Embeddings** | [Google Gemini 1.5 Pro / Flash](https://ai.google.dev/), `text-embedding-004` |
| **Telegram Bot Client** | [Telegraf](https://telegrafjs.org/) |
| **Web Dashboard** | [Next.js 14](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/) |
| **Containerization** | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/) |
| **Reverse Proxy & SSL** | [Nginx](https://nginx.org/) with Let's Encrypt |

---

## 📂 Repository Structure

```text
telemind/
│
├── apps/
│   ├── api/             # NestJS REST API Gateway & Webhook Controller
│   ├── worker/          # BullMQ Background Worker (RAG & Gemini pipelines)
│   └── dashboard/       # Next.js 14 Web Administration Interface
│
├── packages/
│   ├── ai/              # Google Gemini AI Client & Embedding Wrappers
│   ├── telegram/        # Telegraf Bot Handler, Command Router & Helpers
│   ├── rag/             # Document Parsing, Chunking & Retrieval Engine
│   ├── database/        # Prisma Schema, Migrations & pgvector Utilities
│   ├── shared/          # Shared DTOs, Envelopes, Errors & Zod Schemas
│   ├── config/          # Centralized Type-safe Environment Configuration
│   └── logger/          # Structured JSON Logger (Pino)
│
├── docs/                # Enterprise Technical Documentation
│   ├── PRD.md           # Product Requirements Document
│   ├── ARCHITECTURE.md  # System Architecture & Mermaid Diagrams
│   ├── DATABASE.md      # Schema Data Dictionary & ER Diagrams
│   ├── API.md           # REST API Specifications & Contracts
│   ├── ROADMAP.md       # Phased Implementation Plan (Phases 0–10)
│   ├── TASKS.md         # Detailed Engineering Task Backlog
│   ├── DECISIONS.md     # Architecture Decision Log
│   ├── ADR/             # Architecture Decision Records (ADRs)
│   ├── SECURITY.md      # Security Policy & Hardening Guidelines
│   ├── DEPLOYMENT.md    # Production Deployment & VPS Runbooks
│   ├── CONTRIBUTING.md  # Contributor & Pull Request Guidelines
│   ├── CODING_GUIDELINES.md # TypeScript Standards & Clean Code Rules
│   ├── TESTING.md       # Testing Pyramid & Quality Gates
│   └── CHANGELOG.md     # Version History (SemVer)
│
├── docker/              # Dockerfiles and Nginx Configurations
├── scripts/             # Local Setup & Operational Automation Scripts
├── .github/             # GitHub CI Workflows & Issue / PR Templates
├── .vscode/             # Recommended Workspace & Debugger Configurations
├── docker-compose.yml   # Multi-container Compose Specification
├── pnpm-workspace.yaml  # pnpm Monorepo Workspace Configuration
├── package.json         # Root Monorepo Scripts & Dev Dependencies
└── .env.example         # Template Environment Variables
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0` (`corepack enable` or `npm install -g pnpm`)
- **Docker & Docker Compose**: For local PostgreSQL + pgvector and Redis

### Step-by-Step Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/telemind/telemind.git
   cd telemind
   ```

2. **Initialize Environment & Dependencies**:
   - On Linux / macOS:
     ```bash
     chmod +x scripts/setup.sh
     ./scripts/setup.sh
     ```
   - On Windows (PowerShell):
     ```powershell
     .\scripts\setup.ps1
     ```

3. **Configure Environment Secrets**:
   Edit `.env` with your actual development keys:
   ```dotenv
   GEMINI_API_KEY=your_google_gemini_api_key_here
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_from_botfather
   TELEGRAM_WEBHOOK_SECRET=your_random_secret_token
   ```

4. **Start the Infrastructure Containers**:
   ```bash
   pnpm run docker:up
   ```

5. **Generate Database Client & Run Migrations**:
   ```bash
   pnpm run db:generate
   pnpm run db:migrate:dev
   ```

6. **Start All Services in Development Mode**:
   ```bash
   pnpm run dev
   ```

- API Gateway: `http://localhost:3000/api/v1`
- Swagger Docs: `http://localhost:3000/api/docs`
- Web Dashboard: `http://localhost:3001`

---

## 🗺️ Roadmap & Project Status

- **Current Status**: `v0.1.0-alpha.0` - **Phase 0 (Foundation & Scaffolding) Complete**
- Next Milestone: **Phase 1 (Database Architecture & pgvector Integration)**

See [ROADMAP.md](docs/ROADMAP.md) for milestone timelines and [TASKS.md](docs/TASKS.md) for active engineering tasks.

---

## 📚 Documentation Index

| Topic | Document |
|---|---|
| Product Requirements & Scope | [PRD.md](docs/PRD.md) |
| Architecture & Sequence Flows | [ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Database Schema & Vector Indexes | [DATABASE.md](docs/DATABASE.md) |
| REST API Endpoints & Envelopes | [API.md](docs/API.md) |
| Milestones & Timelines | [ROADMAP.md](docs/ROADMAP.md) |
| Engineering Task Backlog | [TASKS.md](docs/TASKS.md) |
| Architectural Decision Records | [DECISIONS.md](docs/DECISIONS.md) |
| Security & Hardening | [SECURITY.md](docs/SECURITY.md) |
| Production VPS Deployment | [DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Contribution & Review Standards | [CONTRIBUTING.md](docs/CONTRIBUTING.md) |
| TypeScript Coding Guidelines | [CODING_GUIDELINES.md](docs/CODING_GUIDELINES.md) |
| Testing Standards & Quality Gates | [TESTING.md](docs/TESTING.md) |

---

## 📄 License

This project is licensed under the terms of the **MIT License**. See the [LICENSE](LICENSE) file for details.
