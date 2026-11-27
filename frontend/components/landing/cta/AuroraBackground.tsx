'use client';

interface AuroraBackgroundProps {
  active: boolean;
  reduceMotion: boolean;
  theme: 'dark' | 'light';
}

export function AuroraBackground({
  active,
  reduceMotion,
  theme,
}: AuroraBackgroundProps) {
  const playState = active && !reduceMotion ? 'running' : 'paused';
  const isDark = theme === 'dark';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Subtle Top Atmospheric Ambient Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[70%] h-[220px]">
        <div
          className="tm-aurora-b w-full h-full rounded-full blur-[95px]"
          style={{
            animationPlayState: playState,
            opacity: isDark ? 0.38 : 0.2,
            background:
              'radial-gradient(circle, rgba(34, 211, 238, 0.45) 0%, rgba(139, 92, 246, 0.35) 55%, transparent 80%)',
          }}
        />
      </div>

      {/* Curved Planetary Horizon Arc */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[16%] sm:top-[18%] w-[180%] sm:w-[155%] aspect-square">
        <div
          className="tm-aurora-a w-full h-full rounded-full"
          style={{
            animationPlayState: playState,
            background: isDark
              ? 'radial-gradient(ellipse 68% 36% at 50% 0%, rgba(165, 243, 252, 0.35) 0%, rgba(34, 211, 238, 0.42) 12%, rgba(139, 92, 246, 0.28) 28%, rgba(6, 11, 24, 0.96) 52%, #000000 72%)'
              : 'radial-gradient(ellipse 68% 36% at 50% 0%, rgba(14, 165, 233, 0.22) 0%, rgba(112, 41, 239, 0.14) 28%, rgba(255, 255, 255, 0.95) 60%)',
            boxShadow: isDark
              ? '0 -2px 6px rgba(255, 255, 255, 0.75), 0 -18px 65px rgba(34, 211, 238, 0.45), 0 -42px 120px rgba(139, 92, 246, 0.35)'
              : '0 -2px 12px rgba(14, 165, 233, 0.35), 0 -24px 80px rgba(112, 41, 239, 0.18)',
            borderTop: isDark
              ? '2px solid rgba(224, 247, 255, 0.9)'
              : '2px solid rgba(14, 165, 233, 0.55)',
          }}
        />
      </div>

      {/* Bottom Fade to Blend Seamlessly into Canvas */}
      <div
        className="absolute inset-x-0 bottom-0 h-28"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, transparent, #000000)'
            : 'linear-gradient(to bottom, transparent, #f6f7fb)',
        }}
      />
    </div>
  );
}
