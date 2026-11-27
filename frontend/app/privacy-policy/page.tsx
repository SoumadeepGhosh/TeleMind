'use client';

import { SubpageShell } from '@/components/landing/SubpageShell';

const SECTIONS = [
  {
    title: '1. Information Collected',
    body: 'TeleMind collects account and organization registration details (such as full name, email address, and organization name), uploaded knowledge-base documents or notes, and channel configuration metadata required to operate your workspace.',
  },
  {
    title: '2. Customer Conversation Data & AI Processing',
    body: 'When connected messaging channels (WhatsApp or Telegram) receive inquiries, message content is processed to retrieve relevant chunks from your organization’s knowledge base and generate responses via configured AI inference providers.',
  },
  {
    title: '3. Tenant Isolation',
    body: 'Knowledge-base embeddings and workspace records are scoped by organization identifier using PostgreSQL Row-Level Security (RLS) policies to separate tenant data across organizations.',
  },
  {
    title: '4. Third-Party Service Providers & Messaging Integrations',
    body: 'Depending on your workspace configuration, message processing and channel delivery interact with third-party providers (such as Meta WhatsApp Cloud API, Telegram Bot API, and configured LLM/embedding providers).',
  },
  {
    title: '5. Data Retention, Deletion & User Rights',
    body: '[Owner Review Required] Specific retention durations, backup deletion timelines, Indian Digital Personal Data Protection Act (DPDP Act) grievance officer details, and formal data-deletion contact channels must be confirmed by the business owner before binding publication.',
  },
  {
    title: '6. Cookies & Local Storage',
    body: 'TeleMind uses browser storage for essential session authentication tokens and theme preferences (dark/light mode).',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SubpageShell>
      <div className="space-y-8 max-w-3xl">
        <div className="space-y-3">
          <span
            className="font-mono text-xs font-semibold tracking-widest uppercase block"
            style={{ color: 'var(--tm-primary)' }}
          >
            LEGAL DRAFT · OWNER &amp; LEGAL REVIEW REQUIRED
          </span>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--tm-text)' }}
          >
            Privacy Policy
          </h1>
          <p className="text-xs font-mono" style={{ color: 'var(--tm-text-subtle)' }}>
            Status: Draft for business owner and legal review · Aligned with Indian DPDP Act considerations.
          </p>
        </div>

        <div className="space-y-5">
          {SECTIONS.map((sec) => (
            <section
              key={sec.title}
              className="rounded-2xl p-6 border space-y-2"
              style={{
                backgroundColor: 'var(--tm-surface-card)',
                borderColor: 'var(--tm-border)',
              }}
            >
              <h2 className="text-base font-bold" style={{ color: 'var(--tm-text)' }}>
                {sec.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--tm-text-muted)' }}>
                {sec.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </SubpageShell>
  );
}
