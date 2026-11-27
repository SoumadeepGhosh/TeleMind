'use client';

import { motion, AnimatePresence } from 'motion/react';
import { formatInr, type BillingCycle } from './pricing-config';

interface AnimatedPriceProps {
  monthlyPrice: number;
  yearlyMonthlyEquivalent: number;
  yearlyTotal: number;
  billing: BillingCycle;
  reduceMotion: boolean;
}

export function AnimatedPrice({
  monthlyPrice,
  yearlyMonthlyEquivalent,
  yearlyTotal,
  billing,
  reduceMotion,
}: AnimatedPriceProps) {
  const displayAmount =
    billing === 'yearly' ? yearlyMonthlyEquivalent : monthlyPrice;

  return (
    <div className="min-h-[68px] flex flex-col justify-center mb-6">
      <div className="flex items-baseline gap-1.5 tabular-nums">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${billing}-${displayAmount}`}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--tm-text)' }}
          >
            {formatInr(displayAmount)}
          </motion.span>
        </AnimatePresence>
        <span className="font-mono text-xs" style={{ color: 'var(--tm-text-subtle)' }}>
          / month
        </span>
      </div>

      <div className="h-4 mt-1">
        <AnimatePresence mode="wait">
          {billing === 'yearly' ? (
            <motion.p
              key="yearly-note"
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
              className="font-mono text-[11px] tabular-nums"
              style={{ color: '#34D399' }}
            >
              Billed {formatInr(yearlyTotal)} / year
            </motion.p>
          ) : (
            <motion.p
              key="monthly-note"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="font-mono text-[11px]"
              style={{ color: 'var(--tm-text-subtle)' }}
            >
              Billed monthly
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
