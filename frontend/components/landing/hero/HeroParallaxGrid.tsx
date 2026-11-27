'use client';

import { motion, type MotionValue } from 'motion/react';
import { HERO_PRODUCT_ROWS } from './hero-products';
import { HeroProductCard } from './HeroProductCard';

interface HeroParallaxGridProps {
  rotateX: MotionValue<number>;
  rotateZ: MotionValue<number>;
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  row1X: MotionValue<number>;
  row2X: MotionValue<number>;
  row3X: MotionValue<number>;
  interactive: boolean;
  reduceMotion: boolean;
  isMobile: boolean;
}

export function HeroParallaxGrid({
  rotateX,
  rotateZ,
  scale,
  opacity,
  y,
  row1X,
  row2X,
  row3X,
  interactive,
  reduceMotion,
  isMobile,
}: HeroParallaxGridProps) {
  const [row1, row2, row3] = HERO_PRODUCT_ROWS;

  return (
    <div
      className="w-full flex flex-col items-center justify-center"
      style={{ perspective: '1300px' }}
    >
      <motion.div
        style={{
          rotateX,
          rotateZ,
          scale,
          opacity,
          y,
          transformStyle: 'preserve-3d',
        }}
        className="w-full flex flex-col gap-4 sm:gap-5 items-center"
      >
        {/* Row 1 -> Right */}
        <motion.div
          style={{ x: row1X }}
          className="flex flex-row gap-5 sm:gap-7 w-max"
        >
          {row1.map((item) => (
            <HeroProductCard
              key={item.id}
              item={item}
              interactive={interactive}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        {/* Row 2 -> Left */}
        <motion.div
          style={{ x: row2X }}
          className="flex flex-row gap-5 sm:gap-7 w-max"
        >
          {row2.map((item) => (
            <HeroProductCard
              key={item.id}
              item={item}
              interactive={interactive}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        {/* Row 3 -> Right (hidden on small mobile for cleaner viewport pacing) */}
        {!isMobile && (
          <motion.div
            style={{ x: row3X }}
            className="flex flex-row gap-5 sm:gap-7 w-max"
          >
            {row3.map((item) => (
              <HeroProductCard
                key={item.id}
                item={item}
                interactive={interactive}
                reduceMotion={reduceMotion}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
