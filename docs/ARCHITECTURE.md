# TeleMind - Technical Architecture Specification

| **Document Version** | 1.0.0 |
| **Architectural Style** | Modular Monorepo / Decoupled Event-Driven Microservices |
| **Status** | Approved |

---

## 1. High-Level System Architecture

TeleMind is designed with a decoupled, asynchronous architecture to handle bursty Telegram messaging loads and compute-intensive Large Language Model (LLM) operations without blocking clients or incurring gateway timeouts.

```mermaid
graph TB
    subgraph Clients["External Clients & Gateways"]
        TG["Telegram Clients (Mobile / Desktop)"]
        WEB["Admin Dashboard (Browser / Next.js)"]
        TG_GW["Telegram Bot Gateway (HTTPS Webhook)"]
    end

    subgraph Ingress["Ingress & Edge Layer"]
        NGINX["Nginx Reverse Proxy / SSL Termination"]
    end

    subgraph AppCluster["TeleMind Compute Cluster"]
        API["apps/api (NestJS API Gateway)"]
        WORKER["apps/worker (NestJS BullMQ Workers)"]
    end

    subgraph StateAndQueue["State, Cache & Queue Layer"]
        REDIS[("Redis 7 (BullMQ & Cache)")]
        PG[("PostgreSQL 16 + pgvector")]
        STORAGE[("Object Storage (Local / S3)")]
    end

    subgraph ExternalAI["External AI Services"]
        GEMINI["Google Gemini API (1.5 Pro / Flash / Embeddings)"]
    end

    TG -->|Encrypted HTTPS| TG_GW
    TG_GW -->|Webhook Update| NGINX
    WEB -->|REST / HTTPS| NGINX
    NGINX -->|Reverse Proxy| API
    
    API -->|Push Task (Async)| REDIS
    API -->|Read/Write Metadata| PG
    API -->|Upload Files| STORAGE

    WORKER -->|Consume Jobs| REDIS
    WORKER -->|Vector Search & Mutations| PG
    WORKER -->|Read Files| STORAGE
    WORKER -->|Generate / Embed| GEMINI
    WORKER -->|Send Reply (HTTPS)| TG_GW
    TG_GW -->|Push Reply| TG
```

---

## 2. Component Decomposition

```mermaid
graph LR
    subgraph Apps
        API["@telemind/api"]
        WORKER["@telemind/worker"]
        DASH["@telemind/dashboard"]
    end

    subgraph Packages
        CONFIG["@telemind/config"]
        LOGGER["@telemind/logger"]
        SHARED["@telemind/shared"]
        DB["@telemind/database"]
        TG["@telemind/telegram"]
        AI["@telemind/ai"]
        RAG["@telemind/rag"]
    end

    API --> CONFIG
    API --> LOGGER
    API --> SHARED
    API --> DB
    API --> TG

    WORKER --> CONFIG
    WORKER --> LOGGER
    WORKER --> SHARED
    WORKER --> DB
    WORKER --> TG
    WORKER --> AI
    WORKER --> RAG

    DASH --> SHARED

    RAG --> AI
    RAG --> DB
```

### Component Roles & Responsibilities

| Component | Technology | Responsibility |
|---|---|---|
| `apps/api` | NestJS, Express, Passport | Webhook receiver, REST API endpoints, JWT authentication, rate limiting. |
| `apps/worker` | NestJS, BullMQ | Asynchronous job processors for message processing, RAG indexing, AI querying. |
| `apps/dashboard` | Next.js 14, Tailwind CSS | Admin interface for knowledge base management, user administration, and system metrics. |
| `packages/database` | Prisma ORM, PostgreSQL | Unified database access layer, schema definitions, migrations, and vector types. |
| `packages/ai` | Google GenAI SDK | Client wrapper for Gemini 1.5 Pro, Flash, and `text-embedding-004`. |
| `packages/telegram` | Telegraf | Telegram Bot API client, command dispatchers, keyboard builders, and webhook validator. |
| `packages/rag` | TypeScript, pdf-parse | Ingestion, recursive chunking, embedding generation, vector similarity search, and context assembly. |
| `packages/shared` | TypeScript, Zod | Shared interfaces, DTOs, API contracts, errors, and validation schemas. |
| `packages/config` | Zod, dotenv | Validated environment configuration loaded once at process startup. |
| `packages/logger` | Pino | Structured JSON logging with trace context and redaction. |

---

## 3. Request Flow (Telegram Ingress to Async Reply)

The primary requirement is to acknowledge Telegram webhooks within **200 milliseconds** to avoid Telegram retrying and duplicating messages. All processing is handed off to BullMQ.

```mermaid
sequenceDiagram
    autonumber
    actor User as Telegram User
    participant TG as Telegram Servers
    participant API as TeleMind API (NestJS)
    participant Redis as Redis (BullMQ Queue)
    participant Worker as TeleMind Worker
    participant Gemini as Gemini AI
    participant DB as PostgreSQL (pgvector)

    User->>TG: Sends "/ask What is the refund policy?"
    TG->>API: POST /api/v1/telegram/webhook (with secret token)
    Note over API: 1. Validate Secret Token<br/>2. Verify Rate Limits<br/>3. Parse Update
    API->>Redis: Enqueue Job into "telemind:telegram:ingest"
    API-->>TG: HTTP 200 OK (Immediate Acknowledgment)
    
    Worker->>Redis: Dequeue Job
    Worker->>TG: Send Chat Action ("typing...")
    Worker->>DB: Fetch User Chat History & Context
    Worker->>Gemini: Generate Embedding for Query
    Gemini-->>Worker: Vector (768 dimensions)
    Worker->>DB: Vector Cosine Similarity Search (DocumentChunks)
    DB-->>Worker: Return Top-K Relevant Chunks + Metadata
    Worker->>Gemini: Generate Answer with Context + System Prompt
    Gemini-->>Worker: Streamed/Final AI Answer with Citations
    Worker->>DB: Persist User Message & Assistant Response
    Worker->>TG: Send Telegram Markdown Message with Source Footnotes
    TG->>User: Displays Answer to User
```

---

## 4. Telegram Message Flow & State Machine

```mermaid
stateDiagram-v2
    [*] --> WebhookReceived: Telegram Update Received
    WebhookReceived --> SignatureValidation: Verify X-Telegram-Bot-Api-Secret-Token
    SignatureValidation --> Dropped: Invalid Signature (403)
    SignatureValidation --> RateCheck: Valid Signature
    
    RateCheck --> RateLimited: Limit Exceeded (HTTP 429)
    RateCheck --> EnqueueJob: Rate Limit OK
    EnqueueJob --> Return200: Push to BullMQ
    Return200 --> [*]

    state BullMQ_Worker {
        [*] --> JobDequeued
        JobDequeued --> ParseMessageType
        ParseMessageType --> HandleCommand: Is Command (/ask, /index, /clear)
        ParseMessageType --> HandleDocument: Is File Attachment (PDF, TXT)
        ParseMessageType --> HandlePlainMessage: Plain Conversation
        
        HandleCommand --> ProcessRAGQuery: /ask
        HandleCommand --> SessionReset: /clear
        HandleDocument --> IngestDocument: Validate & Store
        HandlePlainMessage --> ContextualLLMReply
        
        ProcessRAGQuery --> DispatchTelegramReply
        SessionReset --> DispatchTelegramReply
        IngestDocument --> DispatchTelegramReply
        ContextualLLMReply --> DispatchTelegramReply
        DispatchTelegramReply --> [*]
    }
```

---

## 5. AI & RAG Pipeline Architecture

```mermaid
flowchart TD
    subgraph DocumentIngestion["Document Ingestion Pipeline (Worker)"]
        DOC["Uploaded Document (PDF / MD / TXT)"] --> EXTRACT["Text Extraction & Cleaning"]
        EXTRACT --> CHUNK["Recursive Semantic Chunker<br/>(512 tokens / 64 overlap)"]
        CHUNK --> BATCH_EMB["Batch Embedding Generator<br/>(Gemini text-embedding-004)"]
        BATCH_EMB --> INSERT_PG[("INSERT INTO document_chunks<br/>(vector: 768 dims)")]
    end

    subgraph QueryPipeline["Query Retrieval & Synthesis Pipeline"]
        QUERY["User Natural Language Question"] --> Q_EMB["Gemini text-embedding-004"]
        Q_EMB --> V_SEARCH["Vector Distance Search<br/>SELECT ... ORDER BY embedding <=> query_vec LIMIT 5"]
        INSERT_PG -.-> V_SEARCH
        V_SEARCH --> RERANK["Context Filter & Deduplication"]
        RERANK --> PROMPT_BUILD["Prompt Assembler<br/>(System instructions + Context chunks + History)"]
        PROMPT_BUILD --> LLM["Google Gemini 1.5 Pro / Flash"]
        LLM --> CITATIONS["Citation Formatter & Verification"]
        CITATIONS --> FINAL_RESP["Final Telegram Answer"]
    end
```

---

## 6. Deployment Architecture

```mermaid
graph TD
    subgraph CloudVPS["Cloud VPS or Dedicated Server (Docker Swarm / Compose)"]
        subgraph Edge["Edge Ingress"]
            NGINX_CONTAINER["Nginx Gateway Container<br/>(Ports 80 / 443, SSL via Let's Encrypt)"]
        end

        subgraph CoreServices["Internal Docker Network: telemind-network"]
            API_SVC["telemind-api (Scale: 2x)<br/>Node.js 20 - Port 3000"]
            WORKER_SVC["telemind-worker (Scale: 3x)<br/>Node.js 20 - Concurrency: 5"]
            DASH_SVC["telemind-dashboard (Scale: 1x)<br/>Next.js 14 - Port 3001"]
        end

        subgraph PersistentData["Data Volumes"]
            PG_CONTAINER["telemind-postgres<br/>(pgvector/pgvector:pg16)"]
            REDIS_CONTAINER["telemind-redis<br/>(redis:7-alpine - AOF Persistence)"]
            STORAGE_VOL["Mounted Local Volume / S3 Bucket"]
        end
    end

    INTERNET((Public Internet)) -->|HTTPS| NGINX_CONTAINER
    NGINX_CONTAINER -->|HTTP Upstream| API_SVC
    NGINX_CONTAINER -->|HTTP Upstream| DASH_SVC

    API_SVC --> REDIS_CONTAINER
    API_SVC --> PG_CONTAINER
    API_SVC --> STORAGE_VOL

    WORKER_SVC --> REDIS_CONTAINER
    WORKER_SVC --> PG_CONTAINER
    WORKER_SVC --> STORAGE_VOL

    WORKER_SVC -->|HTTPS Outbound| GEMINI_CLOUD["Google Gemini AI Cloud API"]
    WORKER_SVC -->|HTTPS Outbound| TELEGRAM_API["Telegram Bot API"]
```
