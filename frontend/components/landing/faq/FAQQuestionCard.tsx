'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { FAQItem } from './faq-data';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

interface FAQQuestionCardProps {
  item: FAQItem;
  index: number;
  isActive: boolean;
  inView: boolean;
  reduceMotion: boolean;
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

export function FAQQuestionCard({
  item,
  index,
  isActive,
  inView,
  reduceMotion,
  onSelect,
  onKeyDown,
  buttonRef,
}: FAQQuestionCardProps) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(160);
  const mouseY = useMotionValue(44);
  const spotlightBg = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.16), transparent 75%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion || isActive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.button
      ref={(el) => {
        cardRef.current = el;
        buttonRef(el);
      }}
      type="button"
      role="tab"
      id={`faq-tab-${item.id}`}
      aria-selected={isActive}
      aria-controls="faq-answer-panel"
      tabIndex={isActive ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHovered(false)}
      initial={reduceMotion ? false : { opacity: 0, x: -20 }}
      animate={inView || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{
        duration: reduceMotion ? 0 : 0.4,
        delay: reduceMotion ? 0 : index * 0.085,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative w-full min-h-[84px] rounded-[24px] px-6 py-4 text-left flex items-center justify-between gap-4 border tm-theme-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
      style={{
        backgroundColor: isActive ? 'transparent' : 'var(--tm-surface-card)',
        borderColor: isActive ? 'rgba(124, 58, 237, 0.65)' : 'var(--tm-border)',
        boxShadow: !isActive && hovered ? 'var(--tm-shadow-card), 0 0 16px rgba(57, 255, 20, 0.12)' : undefined,
      }}
    >
      {!isActive && (
        <NeonBorderOverlay
          hovered={hovered}
          active={inView}
          reduceMotion={reduceMotion}
          radiusClass="rounded-[24px]"
        />
      )}
      {/* Shared Sliding Purple Active Background */}
      {isActive && (
        <motion.span
          layoutId="tm-faq-active-bg"
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }
          }
          className="absolute inset-0 rounded-[23px] -z-10"
          style={{
            background: hovered
              ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
              : 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
            boxShadow: hovered
              ? '0 14px 34px rgba(124, 58, 237, 0.45)'
              : '0 10px 28px rgba(124, 58, 237, 0.35)',
          }}
        />
      )}

      {/* Subtle Hover Spotlight on Inactive Cards */}
      {!isActive && !reduceMotion && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[23px] transition-opacity duration-200"
          style={{
            background: spotlightBg as unknown as string,
            opacity: hovered ? 1 : 0,
          }}
        />
      )}

      <span
        className="relative z-10 text-sm sm:text-[15px] font-semibold leading-snug transition-colors duration-200"
        style={{
          color: isActive ? '#FFFFFF' : 'var(--tm-text)',
        }}
      >
        {item.q}
      </span>

      <motion.span
        aria-hidden="true"
        animate={{
          rotate: isActive ? 0 : 90,
          x: isActive && hovered && !reduceMotion ? 4 : 0,
        }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
        className="relative z-10 shrink-0"
        style={{
          color: isActive ? '#FFFFFF' : '#A78BFA',
        }}
      >
        <ArrowRight size={18} />
      </motion.span>
    </motion.button>
  );
}
