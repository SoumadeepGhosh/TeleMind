'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS_DATA } from './testimonials-data';
import { TestimonialCard } from './TestimonialCard';

interface TestimonialMarqueeProps {
  inView: boolean;
  isPaused: boolean;
  isTabHidden: boolean;
  reduceMotion: boolean;
}

export function TestimonialMarquee({
  inView,
  isPaused,
  isTabHidden,
  reduceMotion,
}: TestimonialMarqueeProps) {
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const shouldRun = inView && !isPaused && !hoverPaused && !focusPaused && !isTabHidden;

  const scrollMobileTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(TESTIMONIALS_DATA.length - 1, index));
    setActiveSlide(clamped);
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) {
      el.scrollTo({ left: child.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop / Tablet Seamless Horizontal Marquee */}
      <div
        className="hidden md:block relative overflow-hidden py-2"
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onFocusCapture={() => setFocusPaused(true)}
        onBlurCapture={() => setFocusPaused(false)}
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
        }}
      >
        <div
          className="tm-marquee-track flex items-stretch gap-6 w-max"
          style={{
            animationPlayState: shouldRun ? 'running' : 'paused',
          }}
        >
          {/* Primary accessible set */}
          {TESTIMONIALS_DATA.map((item, idx) => (
            <TestimonialCard
              key={item.id}
              item={item}
              index={idx}
              inView={inView}
              isMobile={false}
              reduceMotion={false}
            />
          ))}

          {/* Duplicate set for seamless loop, hidden from assistive tech */}
          <div aria-hidden="true" className="flex items-stretch gap-6">
            {TESTIMONIALS_DATA.map((item, idx) => (
              <TestimonialCard
                key={`dup-${item.id}`}
                item={item}
                index={idx}
                inView={inView}
                isMobile={false}
                reduceMotion={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Touch Scroll-Snap Carousel */}
      <div className="md:hidden">
        <div
          ref={scrollerRef}
          onScroll={() => {
            const el = scrollerRef.current;
            if (!el) return;
            const idx = Math.round(el.scrollLeft / Math.max(1, el.clientWidth * 0.85));
            setActiveSlide(Math.max(0, Math.min(TESTIMONIALS_DATA.length - 1, idx)));
          }}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-2 px-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {TESTIMONIALS_DATA.map((item, idx) => (
            <div key={item.id} className="snap-center shrink-0 w-[86vw] max-w-[350px]">
              <TestimonialCard
                item={item}
                index={idx}
                inView={inView}
                isMobile={true}
                reduceMotion={false}
                fixedWidth={false}
              />
            </div>
          ))}
        </div>

        {/* Mobile Controls & Pagination */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => scrollMobileTo(activeSlide - 1)}
            disabled={activeSlide === 0}
            className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-35"
            style={{
              backgroundColor: 'var(--tm-surface-low)',
              borderColor: 'var(--tm-border)',
              color: 'var(--tm-text)',
            }}
          >
            <ChevronLeft size={15} />
          </button>

          <div className="flex items-center gap-1.5">
            {TESTIMONIALS_DATA.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to testimonial ${idx + 1}`}
                onClick={() => scrollMobileTo(idx)}
                className="h-1.5 rounded-full transition-all duration-200"
                style={{
                  width: activeSlide === idx ? 18 : 6,
                  backgroundColor:
                    activeSlide === idx ? 'var(--tm-primary-solid)' : 'var(--tm-border-strong)',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => scrollMobileTo(activeSlide + 1)}
            disabled={activeSlide === TESTIMONIALS_DATA.length - 1}
            className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-35"
            style={{
              backgroundColor: 'var(--tm-surface-low)',
              borderColor: 'var(--tm-border)',
              color: 'var(--tm-text)',
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
