'use client';

import { motion } from 'motion/react';

interface TypingIndicatorProps {
  variant: 'ai' | 'operator';
  reduceMotion: boolean;
}

export function TypingIndicator({ variant, reduceMotion }: TypingIndicatorProps) {
  const isAi = variant === 'ai';
  const dotColor = isAi ? '#A78BFA' : '#34D399';
  const label = isAi ? 'AI is processing...' : 'Sarah Jenkins is typing...';

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border w-fit"
      style={{
        backgroundColor: isAi ? 'rgba(139, 92, 246, 0.1)' : 'rgba(52, 211, 153, 0.1)',
        borderColor: isAi ? 'rgba(139, 92, 246, 0.28)' : 'rgba(52, 211, 153, 0.28)',
      }}
    >
      <div className="flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((idx) => (
          <motion.span
            key={idx}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: dotColor }}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -3.5, 0],
                    opacity: [0.45, 1, 0.45],
                  }
            }
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: idx * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <span
        className="text-[11px] font-mono"
        style={{ color: isAi ? '#C4B5FD' : '#6EE7B7' }}
      >
        {label}
      </span>
    </motion.div>
  );
}
