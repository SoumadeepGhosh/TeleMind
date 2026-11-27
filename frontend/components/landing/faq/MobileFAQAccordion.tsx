'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { FAQItem } from './faq-data';

interface MobileFAQAccordionProps {
  items: FAQItem[];
  activeIndex: number;
  reduceMotion: boolean;
  onSelect: (index: number) => void;
}

export function MobileFAQAccordion({
  items,
  activeIndex,
  reduceMotion,
  onSelect,
}: MobileFAQAccordionProps) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = activeIndex === idx;
        return (
          <div
            key={item.id}
            className="rounded-2xl border overflow-hidden transition-colors"
            style={{
              backgroundColor: 'var(--tm-surface-card)',
              borderColor: isOpen ? 'rgba(124, 58, 237, 0.55)' : 'var(--tm-border)',
            }}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => onSelect(idx)}
              className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-all"
              style={{
                background: isOpen
                  ? 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)'
                  : 'transparent',
                color: isOpen ? '#FFFFFF' : 'var(--tm-text)',
              }}
            >
              <span className="text-sm font-semibold leading-snug">{item.q}</span>
              <motion.span
                aria-hidden="true"
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="shrink-0"
                style={{ color: isOpen ? '#FFFFFF' : '#A78BFA' }}
              >
                <ArrowRight size={17} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="mobile-faq-body"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-5 py-4 text-[13px] leading-relaxed"
                    style={{ color: 'var(--tm-text-muted)' }}
                  >
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
