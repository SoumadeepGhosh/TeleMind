'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import type { TestimonialItem } from './testimonials-data';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

interface TestimonialCardProps {
  item: TestimonialItem;
  index: number;
  inView: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
  fixedWidth?: boolean;
}

export function TestimonialCard({
  item,
  index,
  inView,
  isMobile,
  reduceMotion,
  fixedWidth = true,
}: TestimonialCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(180);
  const mouseY = useMotionValue(120);
  const spotlightBg = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.14), rgba(34, 211, 238, 0.06) 45%, transparent 75%)`;

  const disablePointerFx = isMobile || reduceMotion;

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (disablePointerFx || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.article
      ref={cardRef}
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
      animate={
        inView || reduceMotion
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 24, scale: 0.97 }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.45, delay: Math.min(index, 5) * 0.1, ease: [0.22, 1, 0.36, 1] }
      }
      whileHover={disablePointerFx ? undefined : { y: -5 }}
      onPointerEnter={() => !isMobile && setHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHovered(false)}
      className={`relative rounded-2xl p-6 border flex flex-col justify-between transition-all duration-200 ${
        fixedWidth ? 'w-[330px] sm:w-[385px] shrink-0' : 'w-full'
      }`}
      style={{
        backgroundColor: 'var(--tm-surface-card)',
        borderColor: 'var(--tm-border)',
        boxShadow: hovered
          ? 'var(--tm-shadow-card), 0 0 20px rgba(57, 255, 20, 0.14)'
          : 'var(--tm-shadow-card)',
      }}
    >
      <NeonBorderOverlay
        hovered={hovered && !isMobile}
        active={inView}
        reduceMotion={reduceMotion}
        radiusClass="rounded-2xl"
      />
      {/* Mouse-Following Spotlight */}
      {!disablePointerFx && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: spotlightBg,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Sequential Rating Stars */}
          <div className="flex items-center gap-1 text-[#ffbd15]" aria-label={`${item.rating} out of 5 stars`}>
            {Array.from({ length: item.rating }).map((_, i) => (
              <motion.span
                key={i}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                animate={inView || reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                  delay: reduceMotion ? 0 : 0.15 + i * 0.04,
                }}
              >
                <Star size={14} className="fill-[#ffbd15]" />
              </motion.span>
            ))}
          </div>

          {/* Decorative Quote Icon */}
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={
              inView || reduceMotion
                ? {
                    opacity: hovered ? 0.95 : 0.45,
                    scale: hovered && !reduceMotion ? 1.1 : 1,
                  }
                : { opacity: 0, scale: 0.85 }
            }
            transition={{ duration: 0.2 }}
            style={{ color: 'var(--tm-primary)' }}
            aria-hidden="true"
          >
            <Quote size={18} />
          </motion.span>
        </div>

        <p
          className="text-[13px] leading-relaxed mb-6"
          style={{ color: 'var(--tm-text-muted)' }}
        >
          &ldquo;{item.quote}&rdquo;
        </p>
      </div>

      {/* Customer Avatar & Info */}
      <div
        className="relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-xl border"
        style={{
          backgroundColor: 'var(--tm-surface-low)',
          borderColor: 'var(--tm-border)',
        }}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform duration-200 ${item.accent}`}
          style={{
            transform: hovered && !disablePointerFx ? 'scale(1.08)' : 'scale(1)',
            boxShadow: hovered && !disablePointerFx ? `0 0 0 2px ${item.ringColor}` : undefined,
          }}
        >
          {item.initials}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold truncate" style={{ color: 'var(--tm-text)' }}>
            {item.name}
          </div>
          <div className="text-[11px] font-mono truncate" style={{ color: 'var(--tm-text-muted)' }}>
            {item.role}, {item.company}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
