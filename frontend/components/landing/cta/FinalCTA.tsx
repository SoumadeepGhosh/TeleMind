'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { AuroraBackground } from './AuroraBackground';
import { BackgroundLightBeams } from './BackgroundLightBeams';
import { AnimatedBorderBeam } from './AnimatedBorderBeam';
import { MagneticButton } from './MagneticButton';

interface FinalCTAProps {
  theme: 'dark' | 'light';
}

export function FinalCTA({ theme }: FinalCTAProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(containerRef, { once: true, amount: 0.25 });
  const activeInView = useInView(containerRef, { amount: 0.05 });
  const reduceMotion = Boolean(useReducedMotion());

  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ctaEmail, setCtaEmail] = useState('');

  const mouseX = useMotionValue(400);
  const mouseY = useMotionValue(180);
  const spotlightBg = useMotionTemplate`radial-gradient(380px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.14), rgba(34, 211, 238, 0.06) 45%, transparent 78%)`;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile || reduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ctaEmail.trim();
    if (!trimmed) return;
    router.push(`/login?tab=register&email=${encodeURIComponent(trimmed)}`);
  };

  const animItem = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18, scale: 0.98 },
          animate: revealed
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 18, scale: 0.98 },
          transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="py-16 px-5 sm:px-8 max-w-[1280px] mx-auto w-full mb-8">
      <motion.div
        ref={containerRef}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={revealed || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        onPointerEnter={() => !isMobile && !reduceMotion && setHovered(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovered(false)}
        className="relative rounded-3xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden border"
        style={{
          background:
            theme === 'dark'
              ? '#000000'
              : 'linear-gradient(135deg, #f1f0ff, #ffffff, #ecfdf5)',
          borderColor: 'var(--tm-border-strong)',
          boxShadow:
            theme === 'dark'
              ? '0 24px 64px rgba(0, 0, 0, 0.8)'
              : 'var(--tm-shadow-card)',
        }}
      >
        {/* Layer 2: Animated Aurora Background */}
        <AuroraBackground active={activeInView} reduceMotion={reduceMotion} theme={theme} />

        {/* Layer 3: Diagonal Light Beams */}
        <BackgroundLightBeams
          active={activeInView}
          reduceMotion={reduceMotion}
          isMobile={isMobile}
        />

        {/* Layer 4: Mouse-Following Spotlight */}
        {!isMobile && !reduceMotion && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: spotlightBg,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        )}

        {/* Layer 5: CTA Content */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <motion.div
            {...animItem(0.08)}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs mb-4 border"
            style={{
              backgroundColor: 'var(--tm-bg)',
              borderColor: 'var(--tm-border)',
              color: 'var(--tm-secondary)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--tm-tertiary)' }}
            />
            ZERO CREDIT CARD REQUIRED · 14-DAY TRIAL
          </motion.div>

          <motion.h2
            {...animItem(0.16)}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: 'var(--tm-text)' }}
          >
            Deploy Your Multi-Tenant Support Swarm{' '}
            <span
              className="tm-animated-gradient-text bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #A78BFA 0%, #22D3EE 50%, #A78BFA 100%)',
              }}
            >
              in 3 Minutes
            </span>
          </motion.h2>

          <motion.p
            {...animItem(0.24)}
            className="text-base sm:text-lg mb-8 max-w-2xl"
            style={{ color: 'var(--tm-text-muted)' }}
          >
            Integrate your WhatsApp Cloud API, upload your company knowledge base, and experience
            sub-150ms zero-hallucination customer support today.
          </motion.p>

          <motion.form
            {...animItem(0.32)}
            onSubmit={handleSubmit}
            className="w-full max-w-lg flex flex-col sm:flex-row items-center gap-2.5 mb-4"
          >
            <input
              type="email"
              required
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full sm:flex-1 min-w-0 px-4 py-3.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--tm-bg)',
                borderColor: 'var(--tm-border-strong)',
                color: 'var(--tm-text)',
              }}
            />
            <MagneticButton isMobile={isMobile} reduceMotion={reduceMotion}>
              Claim Free Swarm
            </MagneticButton>
          </motion.form>

          {/* Secondary CTA */}
          <motion.div {...animItem(0.38)} className="mb-7">
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono border transition-all hover:border-cyan-400/50 active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'var(--tm-border)',
                color: 'var(--tm-text-muted)',
              }}
            >
              <span>Sign In to Existing Workspace</span>
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            {...animItem(0.45)}
            className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono"
            style={{ color: 'var(--tm-text-muted)' }}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} style={{ color: 'var(--tm-tertiary)' }} />
              SOC2 Type II
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} style={{ color: 'var(--tm-secondary)' }} />
              HIPAA Ready BAA
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} style={{ color: 'var(--tm-primary)' }} />
              GDPR Isolated
            </span>
          </motion.div>
        </div>

        {/* Layer 6: Animated Border Beam */}
        <AnimatedBorderBeam active={activeInView} reduceMotion={reduceMotion} />
      </motion.div>
    </section>
  );
}
