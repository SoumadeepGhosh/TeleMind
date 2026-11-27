export interface FAQItem {
  id: string;
  category: string;
  q: string;
  a: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'rls-isolation',
    category: 'DATA ISOLATION',
    q: 'How does TeleMind physically prevent cross-tenant data leaks?',
    a: 'Unlike simple software multi-tenancy that relies on application-level WHERE clauses, TeleMind enables native PostgreSQL 16 Row-Level Security (RLS) directly on the vector tables. Every incoming webhook connection sets a session context variable (app.current_tenant_id). The database engine rejects any vector retrieval or read query that falls outside that isolated tenant partition.',
  },
  {
    id: 'human-intervention',
    category: 'HYBRID OPERATIONS',
    q: 'What happens when a human agent triggers an intervention?',
    a: 'The instant an operator clicks Takeover in the Unified Team Inbox, the autonomous swarm pauses streaming on that thread. The human operator’s responses flow back to the customer’s WhatsApp or Telegram seamlessly without any disruption or app re-launch. The AI automatically generates an internal summary note of the human conversation.',
  },
  {
    id: 'document-ingestion',
    category: 'KNOWLEDGE VAULT',
    q: 'Which document formats and storage endpoints are supported for ingestion?',
    a: 'TeleMind supports raw PDFs, DOCX files, Notion workspace webhooks, Google Docs sync, Markdown repositories, and recursive website scraping. Uploaded documents pass through automated text sanitization, PII masking, chunk deduplication, and are embedded into 768-dimension vectors.',
  },
  {
    id: 'groq-inference',
    category: 'INFERENCE SPEED',
    q: 'Why use Groq 120B instead of typical cloud LLM API providers?',
    a: 'Messaging channels like WhatsApp and Telegram demand real-time interactivity. Standard GPU cloud providers introduce a 1.5 to 3.5-second time-to-first-token delay. Groq’s Language Processing Units (LPUs) deliver complete 120B reasoning responses in 115ms, making interactions feel native and immediate.',
  },
  {
    id: 'compliance',
    category: 'COMPLIANCE & PRIVACY',
    q: 'Is TeleMind compliant with SOC2 Type II and HIPAA requirements?',
    a: 'Yes. TeleMind operates under strict SOC2 Type II compliance guidelines with end-to-end TLS 1.3 encryption, AES-256 database-at-rest encryption, zero model training on customer data, automated PII scrubbing, and signed Business Associate Agreements (BAA) for healthcare enterprises.',
  },
  {
    id: 'meta-business',
    category: 'CHANNEL SETUP',
    q: 'Do we need our own Meta Developer Business account?',
    a: 'You can bring your existing Meta Business Manager App credentials or provision clean dedicated numbers directly through TeleMind’s verified Cloud API Partner onboarding wizard in under 3 minutes.',
  },
];
