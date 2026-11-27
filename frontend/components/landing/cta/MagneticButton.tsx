'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface MagneticButtonProps {
  children: React.ReactNode;
  isMobile: boolean;
  reduceMotion: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
}

export function MagneticButton({
  children,
  isMobile,
  reduceMotion,
  type = 'submit',
  onClick,
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 280, damping: 20 });
  const y = useSpring(rawY, { stiffness: 280, damping: 20 });

  const disableMagnetic = isMobile || reduceMotion;

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disableMagnetic || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    rawX.set(Math.max(-5, Math.min(5, dx * 5)));
    rawY.set(Math.max(-5, Math.min(5, dy * 5)));
  };

  const handlePointerLeave = () => {
    setHovered(false);
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.button
      ref={btnRef}
      type={type}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className="shrink-0 w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] whitespace-nowrap transition-all duration-200"
      style={{
        boxShadow: hovered
          ? '0 0 28px rgba(124, 58, 237, 0.55)'
          : '0 0 20px rgba(124, 58, 237, 0.35)',
      }}
    >
      <motion.span
        style={disableMagnetic ? undefined : { x, y }}
        className="inline-flex items-center justify-center gap-2"
      >
        <span>{children}</span>
        <motion.span
          animate={hovered && !reduceMotion ? { x: 3 } : { x: 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <ArrowRight size={14} />
        </motion.span>
      </motion.span>
    </motion.button>
  );
}
