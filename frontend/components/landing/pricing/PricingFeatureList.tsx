'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface PricingFeatureListProps {
  features: string[];
  inView: boolean;
  reduceMotion: boolean;
  hovered: boolean;
}

export function PricingFeatureList({
  features,
  inView,
  reduceMotion,
  hovered,
}: PricingFeatureListProps) {
  return (
    <ul className="space-y-2.5 text-xs mb-6">
      {features.map((item, idx) => (
        <motion.li
          key={item}
          initial={reduceMotion ? false : { opacity: 0, x: -6 }}
          animate={inView || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
          transition={{
            duration: reduceMotion ? 0 : 0.3,
            delay: reduceMotion ? 0 : 0.12 + idx * 0.045,
          }}
          className="flex items-center gap-2.5"
          style={{ color: 'var(--tm-text-muted)' }}
        >
          <span
            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200"
            style={{
              backgroundColor: 'rgba(52, 211, 153, 0.14)',
              color: '#34D399',
              transform: hovered && !reduceMotion ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <Check size={11} />
          </span>
          <span>{item}</span>
        </motion.li>
      ))}
    </ul>
  );
}
