'use client';

import { motion } from 'motion/react';
import type { BillingCycle } from './pricing-config';

interface BillingToggleProps {
  billing: BillingCycle;
  savingsPct: number;
  reduceMotion: boolean;
  onChange: (next: BillingCycle) => void;
}

export function BillingToggle({
  billing,
  savingsPct,
  reduceMotion,
  onChange,
}: BillingToggleProps) {
  return (
    <div
      role="group"
      aria-label="Billing cycle"
      className="inline-flex items-center gap-1 p-1.5 rounded-full border relative"
      style={{
        backgroundColor: 'var(--tm-surface-low)',
        borderColor: 'var(--tm-border)',
      }}
    >
      {(['monthly', 'yearly'] as const).map((cycle) => {
        const active = billing === cycle;
        return (
          <button
            key={cycle}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(cycle)}
            className="relative z-10 px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-colors flex items-center gap-2"
            style={{
              color: active ? '#ffffff' : 'var(--tm-text-muted)',
            }}
          >
            {active && (
              <motion.span
                layoutId="tm-billing-pill"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 380, damping: 32 }
                }
                className="absolute inset-0 rounded-full -z-10"
                style={{
                  backgroundColor: 'var(--tm-primary-solid)',
                  boxShadow: '0 0 18px var(--tm-primary-glow)',
                }}
              />
            )}
            <span className="capitalize">{cycle}</span>
            {cycle === 'yearly' && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  backgroundColor: active
                    ? 'rgba(255, 255, 255, 0.18)'
                    : 'rgba(52, 211, 153, 0.16)',
                  color: active ? '#ffffff' : '#34D399',
                }}
              >
                Save ~{savingsPct}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
