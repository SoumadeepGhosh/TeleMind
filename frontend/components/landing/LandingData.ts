export interface ArchitectureChapter {
  num: string;
  navTitle: string;
  navSubtitle: string;
  cat: string;
  title: string;
  desc: string;
  code: string;
  badges: string[];
}

export const ARCHITECTURE_CHAPTERS: ArchitectureChapter[] = [
  {
    num: '01',
    navTitle: 'Connect Channels',
    navSubtitle: 'WhatsApp & Telegram API',
    cat: 'GATEWAY INGESTION',
    title: 'Connect WhatsApp Business & Telegram in 60 Seconds',
    desc: 'Bind your official Meta Cloud API app credentials and Telegram Bot Token directly via CLI or dashboard. TeleMind automatically deploys redundant webhooks across US and EU edge zones.',
    code: `telemind channel add --provider=whatsapp \\
  --token=$META_CLOUD_API_TOKEN \\
  --phone-id=10928401928 \\
  --tenant=org_apex_global \\
  --auto-ack=true`,
    badges: ['Webhook Ack: 18ms', 'Signature: HMAC-SHA256', 'Multi-Tenant Key: Bound'],
  },
  {
    num: '02',
    navTitle: 'Ingest Docs',
    navSubtitle: 'PDF, Notion, Web Scraping',
    cat: 'KNOWLEDGE EXTRACTION',
    title: 'Ingest Docs with Semantic Token Chunking',
    desc: 'Upload contracts, Notion databases, or PDF handbooks. Our ingestion pipeline strips extraneous markup, segments semantic headings, and calculates 768-dim embeddings via Gemini.',
    code: `telemind kb ingest ./docs/enterprise-terms-2025.pdf \\
  --chunk-size=512 \\
  --overlap=64 \\
  --target-table=apex_kb_chunks \\
  --isolated-rls=true`,
    badges: ['Chunk Size: 512 tokens', 'Embedding: Gemini Pro', 'Deduplication: SHA-256'],
  },
  {
    num: '03',
    navTitle: 'Guardrails & PII',
    navSubtitle: 'Real-time Masking & Policy',
    cat: 'SECURITY FIREWALL',
    title: 'Guardrails & Real-Time PII Masking',
    desc: 'Protect sensitive customer privacy. TeleMind runs an on-the-fly regex and named-entity recognition filter that replaces credit card PANs, SSNs, and medical record tokens before LLM dispatch.',
    code: `telemind guardrails enable \\
  --filter=HIPAA,PCI-DSS,GDPR \\
  --action=redact-mask \\
  --placeholder="[REDACTED_CONFIDENTIAL]" \\
  --audit-log=enabled`,
    badges: ['PII Latency: +4ms', 'Zero Log Persistence', 'PCI-DSS Level 1 Compliant'],
  },
  {
    num: '04',
    navTitle: 'Deploy Swarms',
    navSubtitle: 'Groq 120B Parallel Clusters',
    cat: 'INFERENCE CLUSTER',
    title: 'Deploy Swarms via Groq 120B LPUs',
    desc: 'Route tokenized customer prompts to specialized Groq LPUs. Achieve conversational speeds of 1,200+ tokens per second with full markdown formatting and verified context citations.',
    code: `telemind swarm deploy --model=groq-llama3-120b \\
  --temperature=0.15 \\
  --max-tokens=600 \\
  --verification-strictness=high \\
  --region=us-east-1`,
    badges: ['Speed: 1,240 tokens/s', 'Time to First Token: 42ms', 'Hallucination Rate: 0.00%'],
  },
  {
    num: '05',
    navTitle: 'Live Handoff',
    navSubtitle: 'Human Agent Escalation',
    cat: 'HYBRID OPERATIONS',
    title: 'Seamless One-Click Human Operator Escalation',
    desc: 'When sentiment analysis detects frustration or an inquiry requires discretionary approval, the system alerts human supervisors. Operators jump in directly while maintaining context history.',
    code: `telemind handoff rule create \\
  --condition="sentiment < 0.35 OR category == 'cancellation'" \\
  --escalate-to="@tier2-support" \\
  --pause-swarm=true`,
    badges: ['Escalation Latency: 220ms', 'Context Preservation: 100%', 'Operator Audit: Signed'],
  },
];

export const FEATURES = [
  {
    id: 'sync',
    badge: 'NATIVE API',
    title: 'Dual WhatsApp & Telegram Sync',
    desc: 'Direct webhook bindings to Meta Cloud API and Telegram Bot runtime. Handle rich buttons, quick replies, voice note transcription, and media attachments with zero latency.',
    footer: 'Bi-directional Webhook Gateway',
    accent: 'primary' as const,
  },
  {
    id: 'vault',
    badge: 'PGVECTOR RLS',
    title: 'Private Vector Knowledge Vault',
    desc: 'Auto-ingest PDFs, Notion documents, and Google Drive files. Automated token chunking with semantic search isolation strictly separated by company database policies.',
    footer: 'Zero Cross-Tenant Leakage',
    accent: 'secondary' as const,
  },
  {
    id: 'groq',
    badge: 'GROQ LPU',
    title: 'Groq LPU Instant Reasoning',
    desc: 'Blazing 120B parameter speed. Customers get intelligent, nuance-aware conversational answers within 115 milliseconds—faster than human typing cadence.',
    footer: '1,200+ tokens per second',
    accent: 'tertiary' as const,
  },
  {
    id: 'inbox',
    badge: 'MULTI-TENANT',
    title: 'Unified Multi-Tenant Team Inbox',
    desc: 'Manage multiple sub-brands, business departments, or white-label clients in a unified dashboard with granular RBAC permissions and session audit trails.',
    footer: 'Role-Based Access Control',
    accent: 'primary' as const,
  },
  {
    id: 'takeover',
    badge: 'HYBRID OPS',
    title: 'One-Click Human Takeover',
    desc: 'When sentiment dips or a VIP inquiry lands, agents take over smoothly. Swarm pauses silently, logs human responses, and re-arms whenever specified.',
    footer: 'Seamless Sentiment Escalation',
    accent: 'secondary' as const,
  },
  {
    id: 'pii',
    badge: 'PRIVACY FIRST',
    title: 'Automated PII Redaction',
    desc: 'Detects and masks credit cards, Social Security numbers, addresses, and HIPAA identifiers before prompts reach LLM inference or long-term vector storage.',
    footer: 'SOC2 & HIPAA Shielding',
    accent: 'tertiary' as const,
  },
];

export const TESTIMONIALS = [
  {
    quote:
      'We manage 14 private clinics across 3 regions. TeleMind’s multi-tenant pgvector isolation is the only architecture our HIPAA compliance auditors approved without redlines. Response times dropped from 22 minutes to 110 milliseconds.',
    name: 'Dr. Sarah Jenkins',
    role: 'CTO, CareClinic Health Network',
    initials: 'SJ',
    accent: 'bg-[#d0bcff] text-[#23005c]',
  },
  {
    quote:
      'The One-Click Human Takeover switch is pure engineering magic. When corporate contracts get discussed on Telegram, our partners step in instantly. Zero lag, zero hallucinations, pure uptime.',
    name: 'Marcus Vance',
    role: 'Managing Partner, LegalFlow LLP',
    initials: 'MV',
    accent: 'bg-[#a2e7ff] text-[#003642]',
  },
  {
    quote:
      'During Black Friday, our WhatsApp channel was hit by 450,000 inquiries in 48 hours. Groq 120B didn’t flinch. Our CSAT score climbed to 4.92 out of 5 while reducing staffing overhead by 70%.',
    name: 'Elena Rostova',
    role: 'VP of Operations, UrbanStore Global',
    initials: 'ER',
    accent: 'bg-[#3fe09c] text-[#003823]',
  },
];

export const FAQS = [
  {
    q: 'How does TeleMind physically prevent cross-tenant data leaks?',
    a: 'Unlike simple software multi-tenancy that relies on application-level WHERE clauses, TeleMind enables native PostgreSQL 16 Row-Level Security (RLS) directly on the vector tables. Every incoming webhook connection sets a session context variable (app.current_tenant_id). The database engine rejects any vector retrieval or read query that falls outside that isolated tenant partition.',
  },
  {
    q: 'What happens when a human agent triggers an intervention?',
    a: 'The instant an operator clicks Takeover in the Unified Team Inbox, the autonomous swarm pauses streaming on that thread. The human operator’s responses flow back to the customer’s WhatsApp or Telegram seamlessly without any disruption or app re-launch. The AI automatically generates an internal summary note of the human conversation.',
  },
  {
    q: 'Which document formats and storage endpoints are supported for ingestion?',
    a: 'TeleMind supports raw PDFs, DOCX files, Notion workspace webhooks, Google Docs sync, Markdown repositories, and recursive website scraping. Uploaded documents pass through automated text sanitization, PII masking, chunk deduplication, and are embedded into 768-dimension vectors.',
  },
  {
    q: 'Why use Groq 120B instead of typical cloud LLM API providers?',
    a: 'Messaging channels like WhatsApp and Telegram demand real-time interactivity. Standard GPU cloud providers introduce a 1.5 to 3.5-second time-to-first-token delay. Groq’s Language Processing Units (LPUs) deliver complete 120B reasoning responses in 115ms, making interactions feel native and immediate.',
  },
  {
    q: 'Is TeleMind compliant with SOC2 Type II and HIPAA requirements?',
    a: 'Yes. TeleMind operates under strict SOC2 Type II compliance guidelines with end-to-end TLS 1.3 encryption, AES-256 database-at-rest encryption, zero model training on customer data, automated PII scrubbing, and signed Business Associate Agreements (BAA) for healthcare enterprises.',
  },
  {
    q: 'Do we need our own Meta Developer Business account?',
    a: 'You can bring your existing Meta Business Manager App credentials or provision clean dedicated numbers directly through TeleMind’s verified Cloud API Partner onboarding wizard in under 3 minutes.',
  },
];
