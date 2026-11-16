# TeleMind - REST API Specification

| **Document Version** | 1.0.0 |
| **Base URL** | `https://api.telemind.example.com/api/v1` |
| **Authentication** | Bearer JWT / Webhook Secret |
| **Content-Type** | `application/json` |

---

## 1. REST Conventions & Standards

- **HTTP Verbs**:
  - `GET`: Retrieve resource or collection.
  - `POST`: Create resource or trigger action.
  - `PUT`: Complete update of an existing resource.
  - `PATCH`: Partial update of an existing resource.
  - `DELETE`: Remove a resource.
- **URI Design**: Plural nouns in lowercase, kebab-cased (`/api/v1/knowledge-bases`, `/api/v1/documents`).
- **Versioning**: Explicit URL path versioning (`/api/v1`).
- **Pagination**: Query parameters `page` (default: 1) and `limit` (default: 20, max: 100).

---

## 2. Authentication & Authorization

### 2.1 Standard API Endpoints

All protected endpoints require the HTTP `Authorization` header containing a valid JSON Web Token:

```http
Authorization: Bearer <jwt_access_token>
```

### 2.2 Telegram Webhook Endpoint

The Telegram webhook endpoint (`POST /api/v1/telegram/webhook`) is protected via the secret token header:

```http
X-Telegram-Bot-Api-Secret-Token: <configured_telegram_webhook_secret>
```

---

## 3. Standard Envelope & Error Format

### 3.1 Success Response Envelope

```json
{
  "success": true,
  "data": {
    "id": "c1f7a242-b3e2-4682-8bc1-b58cb5b1129b",
    "title": "Employee Handbook 2026.pdf",
    "status": "INDEXED",
    "totalChunks": 48
  },
  "meta": {
    "timestamp": "2026-11-13T12:00:00.000Z",
    "traceId": "req-98f5a6b1-3e44"
  }
}
```

### 3.2 Error Response Format (RFC 7807 Compliant)

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "The document with identifier 'c1f7a242' does not exist.",
    "details": [],
    "statusCode": 404
  },
  "meta": {
    "timestamp": "2026-11-13T12:00:00.000Z",
    "traceId": "req-98f5a6b1-3e44"
  }
}
```

---

## 4. Planned Endpoints Summary

| Method   | Endpoint            | Description                              | Auth Required      |
| -------- | ------------------- | ---------------------------------------- | ------------------ |
| `POST`   | `/telegram/webhook` | Telegram webhook ingress point           | Webhook Secret     |
| `POST`   | `/auth/login`       | User credentials exchange for JWT        | No                 |
| `POST`   | `/auth/refresh`     | Refresh expired access token             | Refresh Token      |
| `GET`    | `/auth/me`          | Fetch active user profile                | Bearer JWT         |
| `GET`    | `/knowledge-bases`  | List available knowledge bases           | Bearer JWT         |
| `POST`   | `/knowledge-bases`  | Create new knowledge base                | Bearer JWT (Admin) |
| `GET`    | `/documents`        | List documents with pagination & filter  | Bearer JWT         |
| `POST`   | `/documents/upload` | Multipart file upload for indexing       | Bearer JWT         |
| `GET`    | `/documents/:id`    | Get document details and chunk status    | Bearer JWT         |
| `DELETE` | `/documents/:id`    | Delete document and delete vector chunks | Bearer JWT (Admin) |
| `POST`   | `/search/query`     | Direct semantic search against knowledge | Bearer JWT         |
| `GET`    | `/health`           | System liveness & readiness check        | No                 |

---

## 5. Detailed Endpoint Contracts

### 5.1 Document Upload

- **`POST /documents/upload`**
- **Content-Type**: `multipart/form-data`

#### Request:

- Form Field `file`: Binary file (PDF, TXT, MD).
- Form Field `knowledgeBaseId`: UUID (optional).

#### Response (HTTP 202 Accepted):

```json
{
  "success": true,
  "data": {
    "documentId": "48b6bbbe-7977-4b13-a006-253bfb6bfa8a",
    "title": "architecture_spec.pdf",
    "status": "PENDING",
    "fileSize": 1428392,
    "jobId": "bullmq:rag:104"
  },
  "meta": {
    "timestamp": "2026-11-13T12:05:00.000Z"
  }
}
```

---

### 5.2 Direct Semantic Search Query

- **`POST /search/query`**
- **Content-Type**: `application/json`

#### Request Body:

```json
{
  "query": "What are the SLA requirements for API response times?",
  "knowledgeBaseId": "c1f7a242-b3e2-4682-8bc1-b58cb5b1129b",
  "topK": 3,
  "generateAnswer": true
}
```

#### Response (HTTP 200 OK):

```json
{
  "success": true,
  "data": {
    "answer": "The SLA requirements state that 95% of API requests must be acknowledged within 250 milliseconds, with RAG generation completing under 3.5 seconds.",
    "citations": [
      {
        "documentId": "48b6bbbe-7977-4b13-a006-253bfb6bfa8a",
        "title": "Service Level Agreement 2026.pdf",
        "chunkIndex": 4,
        "similarityScore": 0.892,
        "snippet": "Section 4.1: API gateway must maintain 95th percentile response times below 250ms..."
      }
    ]
  },
  "meta": {
    "model": "gemini-1.5-pro",
    "tokensUsed": 348,
    "durationMs": 1420
  }
}
```
