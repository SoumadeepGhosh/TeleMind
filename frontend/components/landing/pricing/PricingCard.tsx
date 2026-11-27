'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useMotionTemplate,
} from 'motion/react';
import { ArrowRight, Layers, Sparkles, Cpu } from 'lucide-react';
import type { BillingCycle, PricingPlanConfig } from './pricing-config';
import { AnimatedPrice } from './AnimatedPrice';
import { PricingFeatureList } from './PricingFeatureList';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

interface PricingCardProps {
  plan: PricingPlanConfig;
  billing: BillingCycle;
  index: number;
  sectionInView: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
}

export function PricingCard({
  plan,
  billing,
  index,
  sectionInView,
  isMobile,
  reduceMotion,
}: PricingCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const activeInView = useInView(cardRef, { amount: 0.1 });
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(180);
  const mouseY = useMotionValue(180);

  const spotlightColor =
    plan.accent === 'purple'
      ? 'rgba(139, 92, 246, 0.16)'
      : plan.accent === 'cyan'
      ? 'rgba(34, 211, 238, 0.14)'
      : 'rgba(99, 102, 241, 0.12)';

  const spotlightBg = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 75%)`;

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
      initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.96 }}
      animate={
        sectionInView || reduceMotion
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 30, scale: 0.96 }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              duration: 0.45,
              delay: index * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      whileHover={disablePointerFx ? undefined : { y: -5 }}
      onPointerEnter={() => !isMobile && setHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHovered(false)}
      className="relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full border tm-theme-transition"
      style={{
        backgroundColor: 'var(--tm-surface-card)',
        backgroundImage: plan.popular
          ? 'radial-gradient(circle at 82% 8%, rgba(124, 58, 237, 0.22), transparent 55%)'
          : 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.1), transparent 55%)',
        borderColor: plan.popular ? 'rgba(124, 58, 237, 0.5)' : 'var(--tm-border)',
        boxShadow: hovered
          ? 'var(--tm-shadow-card), 0 0 22px rgba(57, 255, 20, 0.14)'
          : plan.popular
          ? 'var(--tm-shadow-card), 0 0 32px rgba(124, 58, 237, 0.16)'
          : 'var(--tm-shadow-card)',
      }}
    >
      {/* Global 4-Side Neon Green Perimeter Border on Hover */}
      <NeonBorderOverlay
        hovered={hovered && !isMobile}
        active={activeInView}
        reduceMotion={reduceMotion}
        radiusClass="rounded-2xl"
      />

      {/* Recommended Purple Accent Border when Not Hovered */}
      {plan.popular && !hovered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl p-[1.5px] overflow-hidden"
          style={{
            opacity: reduceMotion ? 0.5 : 0.85,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        >
          <div
            className="tm-border-beam-spinner absolute top-1/2 left-1/2 w-[175%] aspect-square"
            style={{
              animationPlayState: activeInView && !reduceMotion ? 'running' : 'paused',
              background:
                'conic-gradient(from 0deg, transparent 0deg 250deg, rgba(124, 58, 237, 0.85) 305deg, rgba(34, 211, 238, 0.8) 340deg, transparent 360deg)',
            }}
          />
        </div>
      )}

      {/* Mouse-Following Inner Spotlight */}
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

      {/* Most Popular Badge */}
      {plan.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full font-mono text-[11px] font-bold text-white shadow-md z-20"
          style={{
            background: 'linear-gradient(90deg, #7C3AED, #8B5CF6)',
            boxShadow: '0 0 18px rgba(139, 92, 246, 0.45)',
          }}
        >
          Most Popular
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: plan.popular
                  ? 'rgba(139, 92, 246, 0.28)'
                  : 'rgba(139, 92, 246, 0.12)',
                borderColor: plan.popular
                  ? 'rgba(168, 85, 247, 0.55)'
                  : 'rgba(139, 92, 246, 0.25)',
                color: plan.popular ? '#E9D5FF' : '#C4B5FD',
              }}
            >
              {plan.id === 'starter' ? (
                <Layers size={16} />
              ) : plan.id === 'growth' ? (
                <Sparkles size={16} />
              ) : (
                <Cpu size={16} />
              )}
            </div>
            <span
              className="font-mono text-[10px] font-bold"
              style={{
                color:
                  plan.accent === 'purple'
                    ? '#C4B5FD'
                    : plan.accent === 'cyan'
                    ? 'var(--tm-secondary)'
                    : 'var(--tm-text-subtle)',
              }}
            >
              {plan.tag}
            </span>
          </div>

          <h3 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--tm-text)' }}>
            {plan.name}
          </h3>
          <p
            className="text-xs leading-relaxed mb-5 min-h-[36px]"
            style={{ color: 'var(--tm-text-muted)' }}
          >
            {plan.audience}
          </p>

          <AnimatedPrice
            monthlyPrice={plan.monthlyPriceInr}
            yearlyMonthlyEquivalent={plan.yearlyMonthlyEquivalentInr}
            yearlyTotal={plan.yearlyTotalInr}
            billing={billing}
            reduceMotion={reduceMotion}
          />

          <PricingFeatureList
            features={plan.features}
            inView={sectionInView}
            reduceMotion={reduceMotion}
            hovered={hovered}
          />
        </div>

        <Link
          href={plan.ctaHref}
          className={`group w-full py-3.5 px-4 rounded-full text-center text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            plan.popular
              ? 'bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white shadow-[0_0_24px_rgba(124,58,237,0.42)]'
              : 'border hover:border-[#7C3AED]/50'
          }`}
          style={
            plan.popular
              ? undefined
              : {
                  backgroundColor: 'var(--tm-surface-low)',
                  borderColor: 'var(--tm-border)',
                  color: 'var(--tm-text)',
                }
          }
        >
          <span>{plan.ctaLabel}</span>
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </motion.article>
  );
}
