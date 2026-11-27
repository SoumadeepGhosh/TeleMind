'use client';

import { SubpageShell } from '@/components/landing/SubpageShell';

const SECTIONS = [
  {
    title: '1. Monthly & Annual Subscriptions',
    body: 'TeleMind plans are offered in Indian Rupees (INR ₹) on monthly (₹299, ₹799, ₹1,999/month) or annual billing cycles (₹2,868, ₹7,668, ₹19,188/year). Annual plans are billed once per year.',
  },
  {
    title: '2. Subscription Cancellation',
    body: '[Commercial Decision Required] Exact cancellation cutoff rules, end-of-cycle access behavior, and self-service cancellation mechanics must be confirmed alongside payment gateway integration.',
  },
  {
    title: '3. Refund Eligibility, Duplicate & Failed Payments',
    body: '[Commercial Decision Required] Refund eligibility windows, pro-rata annual refund rules, duplicate-charge resolution timelines, and failed-payment retry policies require business owner approval before commercial launch.',
  },
  {
    title: '4. Third-Party Messaging Charges',
    body: 'Any conversation or platform fees charged directly by third-party messaging providers (such as Meta WhatsApp Cloud API) are governed by those providers’ billing terms and are separate from TeleMind subscription fees.',
  },
];

export default function RefundPolicyPage() {
  return (
    <SubpageShell>
      <div className="space-y-8 max-w-3xl">
        <div className="space-y-3">
          <span
            className="font-mono text-xs font-semibold tracking-widest uppercase block"
            style={{ color: 'var(--tm-secondary)' }}
          >
            POLICY DRAFT · COMMERCIAL REVIEW REQUIRED
          </span>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--tm-text)' }}
          >
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs font-mono" style={{ color: 'var(--tm-text-subtle)' }}>
            Status: Draft pending final commercial refund rules and payment gateway setup.
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
