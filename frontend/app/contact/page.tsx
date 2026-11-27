'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { SubpageShell } from '@/components/landing/SubpageShell';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  return (
    <SubpageShell>
      <div className="space-y-8 max-w-2xl">
        <div className="space-y-3">
          <span
            className="font-mono text-xs font-semibold tracking-widest uppercase block"
            style={{ color: 'var(--tm-secondary)' }}
          >
            CONTACT (DRAFT)
          </span>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--tm-text)' }}
          >
            Contact TeleMind
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--tm-text-muted)' }}>
            Reach out for workspace onboarding, enterprise quotas, or custom integration questions.
          </p>
        </div>

        <div
          className="rounded-xl p-4 border flex items-start gap-3 text-xs leading-relaxed"
          style={{
            backgroundColor: 'rgba(251, 191, 36, 0.08)',
            borderColor: 'rgba(251, 191, 36, 0.3)',
            color: '#FDE68A',
          }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <strong>Draft Notice:</strong> No backend contact submission endpoint or verified
            public support email is configured yet. Form submission is disabled so no messages are
            silently dropped or falsely confirmed. Existing users can sign in to their{' '}
            <Link href="/login" className="underline">
              workspace
            </Link>
            .
          </div>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-2xl p-6 sm:p-8 border space-y-4"
          style={{
            backgroundColor: 'var(--tm-surface-card)',
            borderColor: 'var(--tm-border)',
            boxShadow: 'var(--tm-shadow-card)',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5 text-xs">
              <span className="font-mono" style={{ color: 'var(--tm-text-muted)' }}>
                Full name
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--tm-bg)',
                  borderColor: 'var(--tm-border)',
                  color: 'var(--tm-text)',
                }}
              />
            </label>

            <label className="block space-y-1.5 text-xs">
              <span className="font-mono" style={{ color: 'var(--tm-text-muted)' }}>
                Business email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--tm-bg)',
                  borderColor: 'var(--tm-border)',
                  color: 'var(--tm-text)',
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5 text-xs">
              <span className="font-mono" style={{ color: 'var(--tm-text-muted)' }}>
                Company name
              </span>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Organization"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--tm-bg)',
                  borderColor: 'var(--tm-border)',
                  color: 'var(--tm-text)',
                }}
              />
            </label>

            <label className="block space-y-1.5 text-xs">
              <span className="font-mono" style={{ color: 'var(--tm-text-muted)' }}>
                Subject
              </span>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Inquiry topic"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--tm-bg)',
                  borderColor: 'var(--tm-border)',
                  color: 'var(--tm-text)',
                }}
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-xs">
            <span className="font-mono" style={{ color: 'var(--tm-text-muted)' }}>
              Message
            </span>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your support volume and channels..."
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--tm-bg)',
                borderColor: 'var(--tm-border)',
                color: 'var(--tm-text)',
              }}
            />
          </label>

          <button
            type="submit"
            disabled
            className="px-6 py-3 rounded-full text-xs font-bold text-white opacity-50"
            style={{ backgroundColor: 'var(--tm-primary-solid)' }}
          >
            Submission Endpoint Pending Configuration
          </button>
        </form>
      </div>
    </SubpageShell>
  );
}
