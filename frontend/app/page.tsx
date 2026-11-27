'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  Sun,
  Moon,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Shield,
  MessageSquare,
  TrendingUp,
  Gauge,
  Lock,
  Check,
} from 'lucide-react';
import {
  DARK_THEME_VARS,
  LIGHT_THEME_VARS,
  type ThemeMode,
} from '@/lib/theme-tokens';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/hero/HeroSection';
import { FeaturesBentoSection } from '@/components/landing/features/FeaturesBentoSection';
import { ArchitectureStepper } from '@/components/landing/ArchitectureStepper';
import { SpotlightSections } from '@/components/landing/SpotlightSections';
import { PricingSection } from '@/components/landing/pricing/PricingSection';
import { TestimonialsSection } from '@/components/landing/testimonials/TestimonialsSection';
import { FAQSection } from '@/components/landing/faq/FAQSection';
import { FinalCTA } from '@/components/landing/cta/FinalCTA';
import { Footer } from '@/components/landing/Footer';

/* ── Animated Metric Counter ── */
function AnimatedMetric({
  target,
  decimals = 0,
  suffix = '',
}: {
  target: number;
  decimals?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(target.toFixed(decimals));
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const duration = 1200;
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = Math.min(1, (now - startTime) / duration);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            setDisplay((target * eased).toFixed(decimals));
            if (elapsed < 1) {
              requestAnimationFrame(tick);
            } else {
              setDisplay(target.toFixed(decimals));
            }
          };

          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

interface MetricCardItem {
  icon: React.ComponentType<{ size?: number }>;
  accentBg: string;
  accentColor: string;
  target: number;
  decimals: number;
  suffix: string;
  title: string;
  subIcon: React.ComponentType<{ size?: number }>;
  subText: string;
  subColor: string;
  sparkPath: string;
  sparkColor: string;
}

function MetricCard({ stat }: { stat: MetricCardItem }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.25 });
  const reduceMotion = Boolean(useReducedMotion());
  const [hovered, setHovered] = useState(false);

  const Icon = stat.icon;
  const SubIcon = stat.subIcon;

  return (
    <div
      ref={cardRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="relative rounded-2xl p-6 border transition-transform duration-300 hover:-translate-y-1 tm-theme-transition"
      style={{
        backgroundColor: 'var(--tm-surface-card)',
        borderColor: 'var(--tm-border)',
        boxShadow: hovered
          ? 'var(--tm-shadow-card), 0 0 18px rgba(57, 255, 20, 0.14)'
          : 'var(--tm-shadow-card)',
      }}
    >
      <NeonBorderOverlay hovered={hovered} active={inView} reduceMotion={reduceMotion} radiusClass="rounded-2xl" />

      <div className="relative z-10 flex items-start justify-between gap-2 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: stat.accentBg, color: stat.accentColor }}
        >
          <Icon size={20} />
        </div>

        {/* Animated SVG Sparkline */}
        <svg viewBox="0 0 72 24" className="w-16 h-6 overflow-visible" aria-hidden="true">
          <motion.path
            d={stat.sparkPath}
            fill="none"
            stroke={stat.sparkColor}
            strokeWidth="2"
            strokeLinecap="round"
            initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={inView || reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.25, ease: 'easeOut' }}
          />
        </svg>
      </div>

      <div
        className="relative z-10 text-3xl lg:text-4xl font-extrabold tracking-tight mb-1"
        style={{ color: 'var(--tm-text)' }}
      >
        <AnimatedMetric target={stat.target} decimals={stat.decimals} suffix={stat.suffix} />
      </div>
      <div className="relative z-10 text-sm font-semibold mb-1.5" style={{ color: 'var(--tm-text)' }}>
        {stat.title}
      </div>
      <div
        className="relative z-10 flex items-center gap-1.5 text-xs font-mono"
        style={{ color: stat.subColor }}
      >
        <SubIcon size={13} />
        <span>{stat.subText}</span>
      </div>
    </div>
  );
}

function subscribeTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('telemind-theme-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('telemind-theme-change', callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  try {
    const stored = localStorage.getItem('telemind-theme');
    return stored === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export default function LandingPage() {
  const theme = useSyncExternalStore<ThemeMode>(subscribeTheme, getThemeSnapshot, () => 'dark');

  const setTheme = (next: ThemeMode) => {
    try {
      localStorage.setItem('telemind-theme', next);
    } catch {
      // Ignore storage errors
    }
    window.dispatchEvent(new Event('telemind-theme-change'));
  };

  useEffect(() => {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', theme);
    }
  }, [theme]);

  // Fallback for browsers without native CSS scroll-driven animations
  useEffect(() => {
    const supportsScrollDriven =
      typeof CSS !== 'undefined' &&
      CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
    const noReducedMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

    if (supportsScrollDriven || !noReducedMotion) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>('.tm-scroll-reveal'));
    targets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Cursor spotlight tracking across glass cards without re-renders
  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = (e.target as HTMLElement).closest('.tm-glass-card') as HTMLElement | null;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div
      data-theme={theme}
      style={theme === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS}
      onPointerMove={handleContainerPointerMove}
      className={`tm-landing min-h-screen flex flex-col relative overflow-x-clip ${theme === 'dark' ? 'dark' : ''}`}
    >
      {/* ── RESIZABLE FLOATING NAVBAR ── */}
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="w-full flex-1 relative">
        {/* ── FLOATING STATUS BAR ── */}
        <div className="absolute top-[84px] inset-x-0 z-40 w-full max-w-[1140px] mx-auto px-5 sm:px-8 pointer-events-none">
          <div
            className="flex items-center justify-between pointer-events-auto backdrop-blur-xl px-4 py-1.5 rounded-full border shadow-lg"
            style={{
              backgroundColor:
                theme === 'dark' ? 'rgba(14, 19, 32, 0.88)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: 'var(--tm-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold"
                style={{
                  backgroundColor: 'var(--tm-surface-high)',
                  color: 'var(--tm-tertiary)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--tm-tertiary)' }}
                />
                CLUSTER: US-EAST-1 (ONLINE)
              </span>
              <span className="hidden md:inline-flex font-mono text-[11px]" style={{ color: 'var(--tm-text-muted)' }}>
                LATENCY:&nbsp;
                <span className="font-bold" style={{ color: 'var(--tm-secondary)' }}>
                  115ms
                </span>
              </span>
              <span className="hidden lg:inline-flex font-mono text-[11px]" style={{ color: 'var(--tm-text-subtle)' }}>
                ISOLATION:&nbsp;
                <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
                  RLS v16.4 ACTIVE
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex items-center p-0.5 rounded-full border"
                style={{
                  backgroundColor: 'var(--tm-surface-high)',
                  borderColor: 'var(--tm-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--tm-primary-solid)' : 'transparent',
                    color: theme === 'dark' ? '#ffffff' : 'var(--tm-text-muted)',
                  }}
                >
                  <Moon size={12} />
                  <span className="hidden sm:inline">CYBER</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all"
                  style={{
                    backgroundColor: theme === 'light' ? 'var(--tm-primary-solid)' : 'transparent',
                    color: theme === 'light' ? '#ffffff' : 'var(--tm-text-muted)',
                  }}
                >
                  <Sun size={12} />
                  <span className="hidden sm:inline">LUMEN</span>
                </button>
              </div>

              <a
                href="#how-it-works"
                className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-mono border transition-colors"
                style={{
                  backgroundColor: 'var(--tm-surface-low)',
                  borderColor: 'var(--tm-border)',
                  color: 'var(--tm-text-muted)',
                }}
              >
                <span>DOCS v2.4</span>
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* ── UNIFIED 3D HERO PARALLAX SECTION ── */}
        <HeroSection />

        {/* ── STATS BAND ── */}
        <section className="py-12 px-5 sm:px-8 max-w-[1280px] mx-auto w-full">
          <div className="tm-scroll-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MessageSquare,
                accentBg: 'rgba(128, 64, 255, 0.16)',
                accentColor: 'var(--tm-primary)',
                target: 11.8,
                decimals: 1,
                suffix: 'M+',
                title: 'Processed Inquiries',
                subIcon: TrendingUp,
                subText: '+34.2% MoM Volume',
                subColor: 'var(--tm-tertiary)',
                sparkPath: 'M 2 20 L 16 16 L 30 17 L 44 11 L 58 7 L 70 3',
                sparkColor: '#8B5CF6',
              },
              {
                icon: Zap,
                accentBg: 'rgba(0, 210, 253, 0.16)',
                accentColor: 'var(--tm-secondary)',
                target: 115,
                decimals: 0,
                suffix: 'ms',
                title: 'Groq 120B Inference',
                subIcon: Gauge,
                subText: 'Sub-150ms token stream',
                subColor: 'var(--tm-secondary)',
                sparkPath: 'M 2 6 L 16 10 L 30 8 L 44 12 L 58 15 L 70 18',
                sparkColor: '#22D3EE',
              },
              {
                icon: Shield,
                accentBg: 'rgba(63, 224, 156, 0.16)',
                accentColor: 'var(--tm-tertiary)',
                target: 100,
                decimals: 0,
                suffix: '%',
                title: 'Tenant Isolation',
                subIcon: Lock,
                subText: 'Postgres RLS Enforced',
                subColor: 'var(--tm-tertiary)',
                sparkPath: 'M 2 12 L 16 12 L 30 12 L 44 12 L 58 12 L 70 12',
                sparkColor: '#10B981',
              },
              {
                icon: CheckCircle2,
                accentBg: 'rgba(128, 64, 255, 0.16)',
                accentColor: 'var(--tm-primary)',
                target: 99.99,
                decimals: 2,
                suffix: '%',
                title: 'Enterprise SLA Guarantee',
                subIcon: Check,
                subText: 'Zero-Downtime Architecture',
                subColor: 'var(--tm-primary)',
                sparkPath: 'M 2 18 L 16 14 L 30 16 L 44 10 L 58 8 L 70 4',
                sparkColor: '#7C3AED',
              },
            ].map((stat) => (
              <MetricCard key={stat.title} stat={stat} />
            ))}
          </div>
        </section>

        {/* ── FEATURES BENTO GRID ── */}
        <FeaturesBentoSection />

        {/* ── SIGNATURE ARCHITECTURE STEPPER ── */}
        <section id="how-it-works" className="py-16 px-5 sm:px-8 max-w-[1280px] mx-auto w-full">
          <div className="tm-scroll-reveal flex flex-col items-center text-center mb-12">
            <span
              className="font-mono text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: 'var(--tm-secondary)' }}
            >
              INTERACTIVE WALKTHROUGH
            </span>
            <h2
              className="text-3xl sm:text-[40px] font-extrabold tracking-tight max-w-2xl leading-[1.15]"
              style={{ color: 'var(--tm-text)' }}
            >
              The Signature Architecture: 5 Chapters to Production
            </h2>
            <p className="text-[15px] max-w-xl mt-3" style={{ color: 'var(--tm-text-muted)' }}>
              Step through our multi-tenant orchestration pipeline from initial channel webhook
              binding to zero-latency AI handoff.
            </p>
          </div>

          <div className="tm-scroll-reveal">
            <ArchitectureStepper />
          </div>
        </section>

        {/* ── DUAL SPOTLIGHT ROWS ── */}
        <SpotlightSections />

        {/* ── PRICING MATRIX ── */}
        <PricingSection />

        {/* ── TESTIMONIALS ── */}
        <TestimonialsSection />

        {/* ── SPLIT-PANEL INTERACTIVE FAQ ── */}
        <FAQSection />

        {/* ── FINAL AURORA CTA BANNER ── */}
        <FinalCTA theme={theme} />
      </main>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
