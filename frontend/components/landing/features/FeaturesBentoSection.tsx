'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { FEATURES } from '../LandingData';
import { BentoFeatureCard } from './BentoFeatureCard';

export function FeaturesBentoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.12 });
  const reduceMotion = Boolean(useReducedMotion());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-16 px-5 sm:px-8 max-w-[1280px] mx-auto w-full"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center mb-12"
      >
        <span
          className="font-mono text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: 'var(--tm-primary)' }}
        >
          ARCHITECTURAL CAPABILITIES
        </span>
        <h2
          className="text-3xl sm:text-[40px] font-extrabold tracking-tight max-w-2xl leading-[1.15]"
          style={{ color: 'var(--tm-text)' }}
        >
          Engineered for Extreme Speed and Strict Compliance
        </h2>
        <p className="text-[15px] max-w-xl mt-3" style={{ color: 'var(--tm-text-muted)' }}>
          Autonomous multi-tenant swarms that orchestrate end-to-end customer resolution while
          honoring cryptographic boundaries.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feat, idx) => (
          <BentoFeatureCard
            key={feat.id}
            feature={feat}
            index={idx}
            sectionInView={inView}
            isMobile={isMobile}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}
