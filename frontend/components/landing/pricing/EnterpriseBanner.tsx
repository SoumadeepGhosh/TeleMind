'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { ENTERPRISE_PLAN } from './pricing-config';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

interface EnterpriseBannerProps {
  inView: boolean;
  reduceMotion: boolean;
}

export function EnterpriseBanner({ inView, reduceMotion }: EnterpriseBannerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.35 }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="relative mt-8 rounded-2xl p-6 sm:p-8 border overflow-hidden tm-theme-transition"
      style={{
        backgroundColor: 'var(--tm-surface-card)',
        borderColor: 'var(--tm-border)',
        boxShadow: hovered
          ? 'var(--tm-shadow-card), 0 0 18px rgba(57, 255, 20, 0.12)'
          : 'var(--tm-shadow-card)',
      }}
    >
      <NeonBorderOverlay hovered={hovered} active={inView} reduceMotion={reduceMotion} radiusClass="rounded-2xl" />
      {/* Subtle Horizontal Light Beam */}
      {!reduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.5) 35%, rgba(34, 211, 238, 0.55) 65%, transparent 100%)',
          }}
        />
      )}

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                borderColor: 'rgba(34, 211, 238, 0.3)',
                color: 'var(--tm-secondary)',
              }}
            >
              {ENTERPRISE_PLAN.tag}
            </span>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--tm-text-muted)' }}>
              {ENTERPRISE_PLAN.priceLabel}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--tm-text)' }}>
            {ENTERPRISE_PLAN.name} — {ENTERPRISE_PLAN.audience}
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--tm-text-muted)' }}>
            {ENTERPRISE_PLAN.description}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
            {ENTERPRISE_PLAN.capabilities.map((cap) => (
              <span
                key={cap}
                className="inline-flex items-center gap-1.5 text-xs font-mono"
                style={{ color: 'var(--tm-text-muted)' }}
              >
                <Check size={13} style={{ color: '#34D399' }} />
                <span>{cap}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href={ENTERPRISE_PLAN.ctaHref}
            className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold border transition-all hover:border-cyan-400/50 active:scale-[0.98]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'var(--tm-border-strong)',
              color: 'var(--tm-text)',
            }}
          >
            <span>{ENTERPRISE_PLAN.ctaLabel}</span>
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
