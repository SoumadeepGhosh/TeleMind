'use client';

interface AnimatedBorderBeamProps {
  active: boolean;
  reduceMotion: boolean;
}

export function AnimatedBorderBeam({ active, reduceMotion }: AnimatedBorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-3xl p-[1.5px] overflow-hidden"
      style={{
        opacity: reduceMotion ? 0.35 : 1,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
    >
      <div
        className="tm-border-beam-spinner absolute top-1/2 left-1/2 w-[160%] aspect-square"
        style={{
          animationPlayState: active && !reduceMotion ? 'running' : 'paused',
          background:
            'conic-gradient(from 0deg, transparent 0deg 260deg, rgba(139, 92, 246, 0.85) 305deg, rgba(34, 211, 238, 0.9) 340deg, transparent 360deg)',
        }}
      />
    </div>
  );
}
