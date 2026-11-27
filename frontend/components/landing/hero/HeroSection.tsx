'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { useHeroParallax } from './useHeroParallax';
import { HeroForeground } from './HeroForeground';
import { HeroParallaxGrid } from './HeroParallaxGrid';

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { amount: 0.05 });
  const {
    shouldReduceMotion,
    tier,
    cardsInteractive,
    gridRotateX,
    gridRotateZ,
    gridScale,
    gridOpacity,
    gridY,
    foregroundOpacity,
    foregroundY,
    overlayOpacity,
    row1X,
    row2X,
    row3X,
  } = useHeroParallax(heroRef);

  const handleWatchDemo = () => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const docTop = window.scrollY + rect.top;
    const targetY = docTop + el.offsetHeight * 0.42;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const isMobile = tier === 'mobile';

  return (
    <section
      ref={heroRef}
      className={`relative w-full ${
        isMobile ? 'h-[165vh]' : 'h-[195vh]'
      }`}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden tm-grid-bg flex flex-col justify-center">
        {/* Layer 1: Volumetric Light Rays & Ambient Glow */}
        <div
          className="tm-light-ray tm-light-ray-primary -top-24 left-[18%] w-[220px] h-[500px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(128, 64, 255, 0.44) 0%, rgba(0, 210, 253, 0.14) 55%, transparent 100%)',
          }}
          aria-hidden="true"
        />
        <div
          className="tm-light-ray tm-light-ray-secondary -top-20 right-[18%] w-[200px] h-[460px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(0, 210, 253, 0.38) 0%, rgba(63, 224, 156, 0.12) 55%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Layer 2: Unified 3D Product Grid */}
        <div className="absolute inset-0 flex items-center justify-center">
          <HeroParallaxGrid
            rotateX={gridRotateX}
            rotateZ={gridRotateZ}
            scale={gridScale}
            opacity={gridOpacity}
            y={gridY}
            row1X={row1X}
            row2X={row2X}
            row3X={row3X}
            interactive={cardsInteractive}
            reduceMotion={shouldReduceMotion}
            isMobile={isMobile}
          />
        </div>

        {/* Layer 3: Radial Readability Overlay (fades out as cards reveal) */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 pointer-events-none z-20"
          aria-hidden="true"
        >
          <div
            className="w-full h-full"
            style={{
              background:
                'radial-gradient(ellipse 64% 54% at 50% 44%, var(--tm-bg) 22%, transparent 88%)',
            }}
          />
        </motion.div>

        {/* Layer 4: Preserved TeleMind Hero Foreground */}
        <HeroForeground
          opacity={foregroundOpacity}
          y={foregroundY}
          interactive={!cardsInteractive}
          heroInView={heroInView}
          onWatchDemo={handleWatchDemo}
        />
      </div>
    </section>
  );
}
