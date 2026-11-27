'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useInView,
} from 'motion/react';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';
import {
  GitMerge,
  Database,
  BrainCircuit,
  Inbox,
  UserCheck,
  EyeOff,
  RefreshCw,
  Lock,
  Gauge,
  Users,
  ArrowLeftRight,
  Shield,
  Zap,
  Check,
} from 'lucide-react';
import { FeatureVisualization } from './FeatureVisualizations';

export interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  desc: string;
  footer: string;
  accent: 'primary' | 'secondary' | 'tertiary';
}

function FeatureIcon({ id }: { id: string }) {
  switch (id) {
    case 'sync':
      return <GitMerge size={20} />;
    case 'vault':
      return <Database size={20} />;
    case 'groq':
      return <BrainCircuit size={20} />;
    case 'inbox':
      return <Inbox size={20} />;
    case 'takeover':
      return <UserCheck size={20} />;
    case 'pii':
      return <EyeOff size={20} />;
    default:
      return <Zap size={20} />;
  }
}

function FeatureFooterIcon({ id }: { id: string }) {
  switch (id) {
    case 'sync':
      return <RefreshCw size={12} />;
    case 'vault':
      return <Lock size={12} />;
    case 'groq':
      return <Gauge size={12} />;
    case 'inbox':
      return <Users size={12} />;
    case 'takeover':
      return <ArrowLeftRight size={12} />;
    case 'pii':
      return <Shield size={12} />;
    default:
      return <Check size={12} />;
  }
}

interface BentoFeatureCardProps {
  feature: FeatureItem;
  index: number;
  sectionInView: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
}

export function BentoFeatureCard({
  feature,
  index,
  sectionInView,
  isMobile,
  reduceMotion,
}: BentoFeatureCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const cardInView = useInView(cardRef, { amount: 0.2 });
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(180);
  const mouseY = useMotionValue(140);

  const disablePointerFx = isMobile || reduceMotion;

  const spotlightColor =
    feature.accent === 'primary'
      ? 'rgba(124, 58, 237, 0.12)'
      : feature.accent === 'secondary'
      ? 'rgba(34, 211, 238, 0.12)'
      : 'rgba(52, 211, 153, 0.12)';

  const spotlightBg = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 75%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (disablePointerFx || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handlePointerLeave = () => {
    setHovered(false);
  };

  const iconColors =
    feature.accent === 'primary'
      ? { bg: 'rgba(139, 92, 246, 0.16)', fg: 'var(--tm-primary)' }
      : feature.accent === 'secondary'
      ? { bg: 'rgba(34, 211, 238, 0.16)', fg: 'var(--tm-secondary)' }
      : { bg: 'rgba(52, 211, 153, 0.16)', fg: 'var(--tm-tertiary)' };

  const footerColor =
    feature.accent === 'primary'
      ? 'var(--tm-secondary)'
      : feature.accent === 'secondary'
      ? 'var(--tm-tertiary)'
      : 'var(--tm-primary)';

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
              type: 'spring',
              stiffness: 220,
              damping: 24,
              delay: index * 0.1,
            }
      }
      whileHover={disablePointerFx ? undefined : { y: -4 }}
      onPointerEnter={() => !isMobile && setHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        backgroundColor: 'var(--tm-surface-card)',
        borderColor: 'var(--tm-border)',
        boxShadow:
          hovered && !isMobile
            ? 'var(--tm-shadow-card), 0 0 20px rgba(57, 255, 20, 0.14)'
            : 'var(--tm-shadow-card)',
      }}
      className="relative rounded-2xl border p-6 flex flex-col justify-between overflow-hidden tm-theme-transition"
    >
      {/* Global 4-Side Neon Green Perimeter Border */}
      <NeonBorderOverlay
        hovered={hovered && !isMobile}
        active={cardInView}
        reduceMotion={reduceMotion}
        radiusClass="rounded-2xl"
      />

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

      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: iconColors.bg, color: iconColors.fg }}
            >
              <FeatureIcon id={feature.id} />
            </div>
            <span
              className="px-2.5 py-0.5 rounded-full font-mono text-[11px] border"
              style={{
                backgroundColor: 'var(--tm-surface-high)',
                borderColor: 'var(--tm-border)',
                color: 'var(--tm-text-muted)',
              }}
            >
              {feature.badge}
            </span>
          </div>

          <h3 className="text-lg font-bold mb-1.5" style={{ color: 'var(--tm-text)' }}>
            {feature.title}
          </h3>
          <p
            className="text-[13px] leading-relaxed mb-4"
            style={{ color: 'var(--tm-text-muted)' }}
          >
            {feature.desc}
          </p>
        </div>

        {/* Unique Miniature Product Visualization */}
        <div className="space-y-3">
          <FeatureVisualization
            id={feature.id}
            active={cardInView}
            hovered={hovered}
            reduceMotion={reduceMotion}
          />

          <div
            className="px-3 py-2 rounded-lg font-mono text-[11px] flex items-center gap-2 border"
            style={{
              backgroundColor: 'var(--tm-surface-low)',
              borderColor: 'var(--tm-border)',
              color: footerColor,
            }}
          >
            <FeatureFooterIcon id={feature.id} />
            <span>{feature.footer}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
