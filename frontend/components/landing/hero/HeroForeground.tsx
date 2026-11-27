'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type MotionValue } from 'motion/react';
import {
  Zap,
  PlayCircle,
  CheckCircle2,
  Shield,
  Database,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const HERO_ROTATING_PHRASES = [
  'Support Swarm',
  'Customer Support',
  'AI Helpdesk',
  'Support Automation',
  'Conversation Engine',
] as const;

interface HeroForegroundProps {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  interactive: boolean;
  heroInView: boolean;
  onWatchDemo: () => void;
}

export function HeroForeground({
  opacity,
  y,
  interactive,
  heroInView,
  onWatchDemo,
}: HeroForegroundProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    if (reduceMotion || !heroInView || tabHidden) return;
    const id = window.setInterval(() => {
      setPhraseIndex((i) => (i + 1) % HERO_ROTATING_PHRASES.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [reduceMotion, heroInView, tabHidden]);

  const currentPhrase = reduceMotion
    ? HERO_ROTATING_PHRASES[0]
    : HERO_ROTATING_PHRASES[phraseIndex];

  return (
    <motion.div
      style={{ opacity, y }}
      className={`relative z-30 max-w-[1280px] mx-auto px-5 sm:px-8 pt-24 sm:pt-28 pb-6 flex flex-col items-center text-center ${
        interactive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Live Engine Badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md mb-5 tm-theme-transition"
        style={{
          backgroundColor: 'var(--tm-surface-card)',
          borderColor: 'var(--tm-border)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--tm-tertiary)' }}
        />
        <span
          className="font-mono text-xs tracking-wide flex items-center gap-1.5"
          style={{ color: 'var(--tm-text)' }}
        >
          <Zap size={13} style={{ color: 'var(--tm-primary)' }} />
          Powered by{' '}
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            Groq 120B
          </span>{' '}
          +{' '}
          <span className="font-bold" style={{ color: 'var(--tm-secondary)' }}>
            Gemini Embeddings
          </span>
        </span>
        <span
          className="hidden sm:inline font-mono text-[11px]"
          style={{ color: 'var(--tm-text-subtle)' }}
        >
          · v2.9-prod
        </span>
      </div>

      {/* Main Headline with Rotating Final Phrase */}
      <h1
        className="text-3xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-extrabold tracking-[-0.03em] max-w-5xl leading-[1.12] mb-4"
        style={{ color: 'var(--tm-text)' }}
      >
        <span>Your AI-Powered 24/7 </span>
        <span
          aria-live="off"
          className="inline-flex justify-center min-h-[1.15em] align-bottom overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={currentPhrase}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #7C3AED 0%, #22D3EE 100%)',
              }}
            >
              {currentPhrase}
            </motion.span>
          </AnimatePresence>
        </span>
      </h1>

      <p
        className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl mb-7"
        style={{ color: 'var(--tm-text-muted)' }}
      >
        Turn inquiries on WhatsApp &amp; Telegram into instant, authoritative resolutions with zero
        hallucinations and strict multi-tenant pgvector isolation.
      </p>

      {/* Dual Primary CTAs (Unified Solid #7C3AED Primary) */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-7">
        <Button href="/login?tab=register" variant="primary" size="lg" withArrow>
          Get Started Free
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onWatchDemo}
        >
          <PlayCircle size={18} style={{ color: 'var(--tm-secondary)' }} />
          <span>Watch 2-Min Demo</span>
        </Button>
      </div>

      {/* Trust Badges Strip */}
      <div
        className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full max-w-4xl py-3 px-4 rounded-2xl border backdrop-blur-md tm-theme-transition"
        style={{
          backgroundColor: 'var(--tm-surface-card)',
          borderColor: 'var(--tm-border)',
          boxShadow: 'var(--tm-shadow-card)',
        }}
      >
        {[
          { icon: CheckCircle2, label: '99.99% Uptime SLA', color: 'var(--tm-tertiary)' },
          { icon: Zap, label: '<140ms Global Ping', color: 'var(--tm-secondary)' },
          { icon: Shield, label: 'SOC2 Type II Ready', color: 'var(--tm-primary)' },
          { icon: Database, label: 'pgvector RLS Vault', color: 'var(--tm-tertiary)' },
          { icon: MessageSquare, label: 'WhatsApp Cloud API', color: 'var(--tm-secondary)', span: true },
        ].map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.label}
              className={`${
                badge.span ? 'col-span-2 md:col-span-1' : ''
              } flex items-center justify-center gap-2 font-mono text-xs`}
              style={{ color: 'var(--tm-text-muted)' }}
            >
              <Icon size={15} style={{ color: badge.color }} className="shrink-0" />
              <span>{badge.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
