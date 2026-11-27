'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { TestimonialMarquee } from './TestimonialMarquee';

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useInView(sectionRef, { once: true, amount: 0.1 });
  const activeInView = useInView(sectionRef, { amount: 0.01 });
  const reduceMotion = Boolean(useReducedMotion());

  const [isPaused, setIsPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 px-5 sm:px-8 max-w-[1280px] mx-auto w-full overflow-hidden"
    >
      {/* Subtle Calm Ambient Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[560px] h-[220px] rounded-full blur-[110px] -z-10 opacity-25"
        style={{
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.42), rgba(34, 211, 238, 0.2), transparent 75%)',
        }}
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={revealed || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
        className="flex flex-col items-center text-center mb-10"
      >
        <span
          className="font-mono text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: 'var(--tm-tertiary)' }}
        >
          PROVEN IN PRODUCTION
        </span>
        <h2
          className="text-3xl sm:text-[40px] font-extrabold tracking-tight max-w-2xl leading-[1.15]"
          style={{ color: 'var(--tm-text)' }}
        >
          Trusted by Engineering Leaders Handling Millions of Inquiries
        </h2>
        <p className="text-[14px] max-w-xl mt-3" style={{ color: 'var(--tm-text-muted)' }}>
          Illustrative customer stories showing how engineering and support teams deploy TeleMind
          across WhatsApp and Telegram.
        </p>

        {/* Accessible Pause / Play Control for Desktop Marquee */}
        <div className="hidden md:flex items-center gap-2 mt-5">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border transition-colors"
            style={{
              backgroundColor: 'var(--tm-surface-low)',
              borderColor: 'var(--tm-border)',
              color: 'var(--tm-text-muted)',
            }}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
            <span>{isPaused ? 'Resume Marquee' : 'Pause Marquee'}</span>
          </button>
        </div>
      </motion.div>

      <TestimonialMarquee
        inView={activeInView || revealed}
        isPaused={isPaused}
        isTabHidden={isTabHidden}
        reduceMotion={reduceMotion}
      />
    </section>
  );
}
