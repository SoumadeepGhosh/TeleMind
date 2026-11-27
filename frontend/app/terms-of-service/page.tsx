'use client';

import { SubpageShell } from '@/components/landing/SubpageShell';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using TeleMind, you agree to comply with these Terms of Service on behalf of yourself and your organization.',
  },
  {
    title: '2. Account & Organization Responsibilities',
    body: 'Workspace owners and administrators are responsible for maintaining the confidentiality of their login credentials, managing team member roles, and ensuring uploaded knowledge-base content is authorized for use.',
  },
  {
    title: '3. AI-Generated Responses & Limitations',
    body: 'TeleMind uses automated AI models to generate responses grounded in your uploaded documents. Organizations should review critical workflows and utilize Human Operator Intervention where discretionary or regulated decisions are required.',
  },
  {
    title: '4. Subscription Plans & Usage Limits (INR)',
    body: 'Launch plans are displayed in Indian Rupees (INR ₹): Starter (₹299/month, 500 AI messages/month), Growth (₹799/month, 2,000 AI messages/month), Pro Swarm (₹1,999/month, 5,000 AI messages/month), and Enterprise (Custom Pricing). Applicable taxes (such as GST) and third-party messaging fees may apply separately.',
  },
  {
    title: '5. Third-Party Integrations & Acceptable Use',
    body: 'Use of WhatsApp Business and Telegram integrations is also subject to the respective platform policies. Abuse, unauthorized scraping, or attempts to bypass tenant isolation are prohibited.',
  },
  {
    title: '6. Governing Law & Legal Entity Details',
    body: '[Owner Review Required] Registered legal entity name, jurisdiction, service-level commitments, and official legal notice contact address must be finalized by the business owner and legal counsel prior to commercial launch.',
  },
];

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="text-xs font-mono" style={{ color: 'var(--tm-text-subtle)' }}>
            Status: Draft for business owner and legal review · Aligned with TeleMind INR pricing tiers.
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
