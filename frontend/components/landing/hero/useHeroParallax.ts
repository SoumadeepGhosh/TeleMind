'use client';

import { useEffect, useState } from 'react';
import {
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'motion/react';

type ViewportTier = 'mobile' | 'tablet' | 'laptop' | 'desktop';

function getViewportTier(width: number): ViewportTier {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1280) return 'laptop';
  return 'desktop';
}

export function useHeroParallax(targetRef: React.RefObject<HTMLElement | null>) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [tier, setTier] = useState<ViewportTier>('desktop');
  const [cardsInteractive, setCardsInteractive] = useState(false);

  useEffect(() => {
    const update = () => setTier(getViewportTier(window.innerWidth));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.8,
  });

  // Use direct scroll progress without spring bounce when reduced motion is preferred
  const progress = shouldReduceMotion ? scrollYProgress : smoothProgress;

  // Enable pointer-events on cards once they emerge from behind the headline
  useEffect(() => {
    const unsubscribe = progress.on('change', (v) => {
      const next = v >= 0.34;
      setCardsInteractive((prev) => (prev === next ? prev : next));
    });
    return () => unsubscribe();
  }, [progress]);

  const config = {
    desktop: {
      rotateX: shouldReduceMotion ? 12 : 18,
      rotateZ: shouldReduceMotion ? -4 : -8,
      scale: shouldReduceMotion ? 0.96 : 1.02,
      endScale: 0.94,
      startY: -24,
      endY: 16,
      shiftX: shouldReduceMotion ? 140 : 280,
    },
    laptop: {
      rotateX: shouldReduceMotion ? 10 : 16,
      rotateZ: shouldReduceMotion ? -4 : -7,
      scale: shouldReduceMotion ? 0.94 : 0.98,
      endScale: 0.9,
      startY: -20,
      endY: 14,
      shiftX: shouldReduceMotion ? 110 : 220,
    },
    tablet: {
      rotateX: shouldReduceMotion ? 8 : 12,
      rotateZ: shouldReduceMotion ? -3 : -5,
      scale: 0.96,
      endScale: 0.92,
      startY: -16,
      endY: 12,
      shiftX: shouldReduceMotion ? 80 : 150,
    },
    mobile: {
      rotateX: 6,
      rotateZ: -2,
      scale: 0.96,
      endScale: 0.94,
      startY: -10,
      endY: 10,
      shiftX: shouldReduceMotion ? 45 : 90,
    },
  }[tier];

  // Phase 1 -> 2: Unfold from behind hero headline into showcase
  const gridRotateX = useTransform(progress, [0.05, 0.4], [config.rotateX, 0]);
  const gridRotateZ = useTransform(progress, [0.05, 0.4], [config.rotateZ, 0]);
  const gridScale = useTransform(progress, [0.05, 0.4], [config.scale, config.endScale]);
  const gridOpacity = useTransform(progress, [0.05, 0.38], [0.52, 1]);
  const gridY = useTransform(progress, [0.05, 0.4], [config.startY, config.endY]);

  // Foreground fades/lifts smoothly out of the way as cards reveal
  const foregroundOpacity = useTransform(progress, [0.08, 0.32], [1, 0]);
  const foregroundY = useTransform(
    progress,
    [0.08, 0.32],
    shouldReduceMotion ? [0, -24] : [0, -80]
  );

  // Readability overlay fades away as cards become foreground showcase
  const overlayOpacity = useTransform(progress, [0.1, 0.38], [1, 0]);

  // Phase 3: Alternating horizontal row movement (0.42 -> 0.88)
  const row1X = useTransform(
    progress,
    [0.42, 0.88],
    [-config.shiftX * 0.45, config.shiftX * 0.65]
  );
  const row2X = useTransform(
    progress,
    [0.42, 0.88],
    [config.shiftX * 0.45, -config.shiftX * 0.65]
  );
  const row3X = useTransform(
    progress,
    [0.42, 0.88],
    [-config.shiftX * 0.45, config.shiftX * 0.65]
  );

  return {
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
  };
}
