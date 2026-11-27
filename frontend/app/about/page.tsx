'use client';

import { motion, useReducedMotion } from 'motion/react';
import { BrainCircuit, Database, UserCheck, MessageSquare } from 'lucide-react';
import { SubpageShell } from '@/components/landing/SubpageShell';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  const reduceMotion = Boolean(useReducedMotion());

  const pillars = [
    {
      icon: BrainCircuit,
      title: 'Grounded AI Support',
      desc: 'TeleMind connects your company knowledge base with fast inference so customer questions on WhatsApp and Telegram are answered from your verified documents rather than generic guesses.',
    },
    {
      icon: Database,
      title: 'Multi-Tenant Isolation',
      desc: 'Every organization operates inside its own isolated tenant context using PostgreSQL Row-Level Security (RLS) and pgvector embeddings so customer data stays separated by organization.',
    },
    {
      icon: UserCheck,
      title: 'Human Operator Intervention',
      desc: 'When an inquiry requires human judgment, operators can pause autonomous AI replies in one click and continue the conversation directly with full thread history intact.',
    },
    {
      icon: MessageSquare,
      title: 'Omnichannel Messaging',
      desc: 'Unifies WhatsApp Business and Telegram channels in a single multi-tenant workspace with team role-based access control.',
    },
  ];

  return (
    <SubpageShell>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
        className="space-y-10"
      >
        <div className="space-y-4">
          <span
            className="font-mono text-xs font-semibold tracking-widest uppercase block"
            style={{ color: 'var(--tm-primary)' }}
          >
            ABOUT TELEMIND
          </span>
          <h1
            className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12]"
            style={{ color: 'var(--tm-text)' }}
          >
            Autonomous Support Built for Multi-Tenant Reliability
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--tm-text-muted)' }}>
            TeleMind is an AI-powered customer support platform designed to help businesses automate
            repetitive inquiries on WhatsApp and Telegram, keep knowledge strictly isolated per
            organization, and hand off seamlessly to human operators whenever needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : idx * 0.08 }}
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: 'var(--tm-surface-card)',
                  borderColor: 'var(--tm-border)',
                  boxShadow: 'var(--tm-shadow-card)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.16)',
                    color: 'var(--tm-primary)',
                  }}
                >
                  <Icon size={20} />
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--tm-text)' }}>
                  {item.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--tm-text-muted)' }}>
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--tm-surface-low)',
            borderColor: 'var(--tm-border-strong)',
          }}
        >
          <div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--tm-text)' }}>
              Ready to explore TeleMind?
            </h2>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--tm-text-muted)' }}>
              Create a workspace or inspect the interactive demos on the homepage.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button href="/#security" variant="secondary" size="sm">
              View Live Demo
            </Button>
            <Button href="/login?tab=register" variant="primary" size="sm" withArrow>
              Get Started
            </Button>
          </div>
        </div>
      </motion.div>
    </SubpageShell>
  );
}
