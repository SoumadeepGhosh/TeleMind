'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQ_ITEMS, type FAQItem } from './faq-data';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

interface FAQAnswerPanelProps {
  activeItem: FAQItem;
  activeIndex: number;
  inView: boolean;
  reduceMotion: boolean;
}

export function FAQAnswerPanel({
  activeItem,
  activeIndex,
  inView,
  reduceMotion,
}: FAQAnswerPanelProps) {
  const [hovered, setHovered] = useState(false);
  const numLabel = `${String(activeIndex + 1).padStart(2, '0')} / ${String(
    FAQ_ITEMS.length
  ).padStart(2, '0')}`;

  return (
    <motion.div
      role="tabpanel"
      id="faq-answer-panel"
      aria-labelledby={`faq-tab-${activeItem.id}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      initial={reduceMotion ? false : { opacity: 0, x: 20 }}
      animate={inView || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-[28px] p-8 lg:p-11 border h-full min-h-[420px] flex flex-col justify-between overflow-hidden tm-theme-transition"
      style={{
        backgroundColor: 'var(--tm-surface-card)',
        borderColor: 'var(--tm-border)',
        boxShadow: hovered
          ? 'var(--tm-shadow-card), 0 0 20px rgba(57, 255, 20, 0.12)'
          : 'var(--tm-shadow-card)',
      }}
    >
      <NeonBorderOverlay hovered={hovered} active={inView} reduceMotion={reduceMotion} radiusClass="rounded-[28px]" />
      {/* Restrained Decorative Ambient Corner Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.65), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/4 w-72 h-40 rounded-full blur-[80px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.55), transparent 70%)' }}
      />

      {/* Animated Answer Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className="px-3 py-1 rounded-full font-mono text-[11px] font-semibold border"
                style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.14)',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  color: '#C4B5FD',
                }}
              >
                {activeItem.category}
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--tm-text-subtle)' }}>
                {numLabel}
              </span>
            </div>

            <h3
              className="text-xl sm:text-2xl font-bold leading-snug"
              style={{ color: 'var(--tm-text)' }}
            >
              {activeItem.q}
            </h3>

            <p
              className="text-[15px] leading-relaxed"
              style={{ color: 'var(--tm-text-muted)' }}
            >
              {activeItem.a}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Bottom Cyan Accent Line */}
      <div
        className="relative z-10 pt-6 mt-8 border-t flex items-center justify-between text-xs font-mono"
        style={{ borderColor: 'rgba(148, 163, 184, 0.12)', color: 'var(--tm-text-subtle)' }}
      >
        <span>TeleMind Architecture &amp; Compliance</span>
        <span style={{ color: '#22D3EE' }}>Verified Documentation</span>
      </div>
    </motion.div>
  );
}
