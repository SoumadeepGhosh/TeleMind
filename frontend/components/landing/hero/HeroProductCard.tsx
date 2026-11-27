'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { HeroProductItem } from './hero-products';
import { HeroProductPreview } from './HeroProductPreview';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

interface HeroProductCardProps {
  item: HeroProductItem;
  interactive: boolean;
  reduceMotion: boolean;
}

export function HeroProductCard({
  item,
  interactive,
  reduceMotion,
}: HeroProductCardProps) {
  const [hovered, setHovered] = useState(false);

  const badgeStyle =
    item.accent === 'purple'
      ? { backgroundColor: 'rgba(124, 58, 237, 0.14)', borderColor: 'rgba(124, 58, 237, 0.35)', color: 'var(--tm-primary)' }
      : item.accent === 'cyan'
      ? { backgroundColor: 'rgba(34, 211, 238, 0.14)', borderColor: 'rgba(34, 211, 238, 0.35)', color: 'var(--tm-secondary)' }
      : { backgroundColor: 'rgba(52, 211, 153, 0.14)', borderColor: 'rgba(52, 211, 153, 0.35)', color: 'var(--tm-tertiary)' };

  return (
    <motion.article
      whileHover={
        interactive && !reduceMotion
          ? { y: -6, scale: 1.02 }
          : undefined
      }
      onPointerEnter={() => interactive && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`relative w-[260px] sm:w-[310px] lg:w-[350px] xl:w-[380px] h-[175px] sm:h-[190px] lg:h-[205px] shrink-0 rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between select-none tm-theme-transition ${
        interactive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        backgroundColor: 'var(--tm-surface-card)',
        borderColor: 'var(--tm-border)',
        boxShadow:
          hovered && interactive
            ? 'var(--tm-shadow-card), 0 0 18px rgba(57, 255, 20, 0.14)'
            : 'var(--tm-shadow-card)',
      }}
    >
      <NeonBorderOverlay
        hovered={hovered && interactive}
        reduceMotion={reduceMotion}
        radiusClass="rounded-2xl"
      />

      {/* Window Header */}
      <div
        className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b"
        style={{ borderColor: 'var(--tm-border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-slate-400/35" />
            <span className="w-2 h-2 rounded-full bg-slate-400/35" />
            <span className="w-2 h-2 rounded-full bg-slate-400/35" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-[13px] font-bold truncate" style={{ color: 'var(--tm-text)' }}>
              {item.title}
            </h3>
            <p className="text-[10px] font-mono truncate" style={{ color: 'var(--tm-text-muted)' }}>
              {item.subtitle}
            </p>
          </div>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold border shrink-0"
          style={badgeStyle}
        >
          {item.badge}
        </span>
      </div>

      {/* Product Preview Body */}
      <div className="relative z-10 pt-2.5 flex-1 flex flex-col justify-center overflow-hidden">
        <HeroProductPreview variant={item.variant} />
      </div>
    </motion.article>
  );
}
