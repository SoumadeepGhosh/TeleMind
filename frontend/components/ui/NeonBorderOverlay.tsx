'use client';

interface NeonBorderOverlayProps {
  hovered: boolean;
  active?: boolean;
  reduceMotion?: boolean;
  radiusClass?: string;
}

/**
 * Reusable 4-side animated neon green (#39FF14) perimeter border overlay.
 * Place inside a `position: relative` card with matching border-radius.
 */
export function NeonBorderOverlay({
  hovered,
  active = true,
  radiusClass = 'rounded-2xl',
}: NeonBorderOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${radiusClass} p-[1.5px] overflow-hidden transition-opacity ${
        hovered ? 'duration-200' : 'duration-500'
      }`}
      style={{
        opacity: hovered ? 1 : 0,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
    >
      <div
        className="tm-neon-perimeter-spin absolute top-1/2 left-1/2 w-[220%] aspect-square"
        style={{
          animationPlayState: hovered && active ? 'running' : 'paused',
          background:
            'conic-gradient(from 0deg, transparent 0deg 235deg, rgba(57, 255, 20, 0.35) 265deg, #39FF14 315deg, rgba(57, 255, 20, 0.45) 345deg, transparent 360deg)',
        }}
      />
    </div>
  );
}
