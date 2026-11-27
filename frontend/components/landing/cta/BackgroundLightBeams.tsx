'use client';

interface BackgroundLightBeamsProps {
  active: boolean;
  reduceMotion: boolean;
  isMobile: boolean;
}

export function BackgroundLightBeams({
  active,
  reduceMotion,
  isMobile,
}: BackgroundLightBeamsProps) {
  const playState = active && !reduceMotion ? 'running' : 'paused';

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: reduceMotion ? 0 : 1 }}
      aria-hidden="true"
    >
      <div
        className="tm-diag-beam-1 absolute top-0 left-0 w-[140%] h-[1.5px]"
        style={{
          animationPlayState: playState,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.65) 45%, rgba(34, 211, 238, 0.75) 60%, transparent 100%)',
        }}
      />
      {!isMobile && (
        <div
          className="tm-diag-beam-2 absolute top-1/4 left-0 w-[140%] h-[1px]"
          style={{
            animationPlayState: playState,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.55) 45%, rgba(139, 92, 246, 0.6) 60%, transparent 100%)',
          }}
        />
      )}
    </div>
  );
}
