export type HeroPreviewVariant =
  | 'inbox'
  | 'whatsapp'
  | 'telegram'
  | 'takeover'
  | 'swarm'
  | 'knowledge'
  | 'groq'
  | 'vector'
  | 'pii'
  | 'playground'
  | 'rls'
  | 'team'
  | 'integrations'
  | 'telemetry'
  | 'billing';

export interface HeroProductItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  variant: HeroPreviewVariant;
  accent: 'purple' | 'cyan' | 'emerald';
}

export const HERO_PRODUCT_ROWS: [
  HeroProductItem[],
  HeroProductItem[],
  HeroProductItem[],
] = [
  // Row 1: Customer Support Experience (moves right →)
  [
    {
      id: 'live-inbox',
      title: 'Live Conversation Inbox',
      subtitle: 'Unified WhatsApp & Telegram threads',
      badge: 'INBOX',
      variant: 'inbox',
      accent: 'purple',
    },
    {
      id: 'whatsapp-cloud',
      title: 'WhatsApp Cloud Gateway',
      subtitle: 'Meta Cloud API · Verified 99.4%',
      badge: 'WHATSAPP',
      variant: 'whatsapp',
      accent: 'emerald',
    },
    {
      id: 'telegram-stream',
      title: 'Telegram Bot Gateway',
      subtitle: '@TeleMindOpsBot · 0 Retries',
      badge: 'TELEGRAM',
      variant: 'telegram',
      accent: 'cyan',
    },
    {
      id: 'operator-takeover',
      title: 'Live Operator Intervention',
      subtitle: 'One-click human escalation',
      badge: 'HYBRID OPS',
      variant: 'takeover',
      accent: 'cyan',
    },
    {
      id: 'swarm-console',
      title: 'AI Support Agent Swarm',
      subtitle: 'Autonomous Agent #4 · 115ms',
      badge: 'SWARM',
      variant: 'swarm',
      accent: 'purple',
    },
  ],

  // Row 2: AI and Automation (moves left ←)
  [
    {
      id: 'knowledge-vault',
      title: 'Private Knowledge Vault',
      subtitle: 'PDF, Notion & Drive ingestion',
      badge: 'KNOWLEDGE',
      variant: 'knowledge',
      accent: 'emerald',
    },
    {
      id: 'groq-inference',
      title: 'Groq 120B LPU Engine',
      subtitle: '1,240 tokens/sec · 42ms TTFT',
      badge: 'GROQ LPU',
      variant: 'groq',
      accent: 'cyan',
    },
    {
      id: 'semantic-vector',
      title: 'Semantic Vector Search',
      subtitle: 'pgvector cosine match 0.941',
      badge: 'EMBEDDINGS',
      variant: 'vector',
      accent: 'purple',
    },
    {
      id: 'pii-redaction',
      title: 'Automated PII Redaction',
      subtitle: 'HIPAA & PCI-DSS masking',
      badge: 'GUARDRAILS',
      variant: 'pii',
      accent: 'emerald',
    },
    {
      id: 'agent-playground',
      title: 'AI Agent Playground',
      subtitle: 'Citation strictness & prompt test',
      badge: 'PLAYGROUND',
      variant: 'playground',
      accent: 'purple',
    },
  ],

  // Row 3: Management and Infrastructure (moves right →)
  [
    {
      id: 'postgres-rls',
      title: 'Postgres 16 RLS Isolation',
      subtitle: 'Cryptographic tenant partitioning',
      badge: 'SECURITY',
      variant: 'rls',
      accent: 'emerald',
    },
    {
      id: 'multi-tenant-team',
      title: 'Multi-Tenant Team RBAC',
      subtitle: 'Org workspaces & audit trails',
      badge: 'TEAM',
      variant: 'team',
      accent: 'purple',
    },
    {
      id: 'integrations-hub',
      title: 'Channel & API Integrations',
      subtitle: 'HMAC-SHA256 verified webhooks',
      badge: 'WEBHOOKS',
      variant: 'integrations',
      accent: 'cyan',
    },
    {
      id: 'sla-telemetry',
      title: 'Performance & SLA Monitor',
      subtitle: '99.99% Uptime · <140ms Ping',
      badge: 'TELEMETRY',
      variant: 'telemetry',
      accent: 'cyan',
    },
    {
      id: 'usage-billing',
      title: 'Usage & Volume Matrix',
      subtitle: 'Predictable message quotas',
      badge: 'BILLING',
      variant: 'billing',
      accent: 'purple',
    },
  ],
];
