'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { FAQ_ITEMS } from './faq-data';
import { FAQQuestionCard } from './FAQQuestionCard';
import { FAQAnswerPanel } from './FAQAnswerPanel';
import { MobileFAQAccordion } from './MobileFAQAccordion';

export function FAQSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  const reduceMotion = Boolean(useReducedMotion());
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    let nextIdx = idx;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = (idx + 1) % FAQ_ITEMS.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = (idx - 1 + FAQ_ITEMS.length) % FAQ_ITEMS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIdx = FAQ_ITEMS.length - 1;
    } else {
      return;
    }
    setActiveIndex(nextIdx);
    tabRefs.current[nextIdx]?.focus();
  };

  const activeItem = FAQ_ITEMS[activeIndex] ?? FAQ_ITEMS[0];

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-16 px-5 sm:px-8 max-w-[1280px] mx-auto w-full"
    >
      {/* Left-Aligned Header */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
        className="mb-10 text-left max-w-2xl"
      >
        <span
          className="font-mono text-xs font-semibold tracking-widest uppercase block mb-2"
          style={{ color: 'var(--tm-primary)' }}
        >
          TECHNICAL CLARIFICATIONS
        </span>
        <h2
          className="text-3xl sm:text-[40px] font-extrabold tracking-tight leading-[1.15]"
          style={{ color: 'var(--tm-text)' }}
        >
          Still Have Questions?
        </h2>
        <p className="text-[15px] mt-2.5" style={{ color: 'var(--tm-text-muted)' }}>
          Everything engineering and operations teams ask before deploying TeleMind.
        </p>
      </motion.div>

      {/* Desktop / Tablet Split-Panel Layout */}
      <div className="hidden md:grid md:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* Left Question Column (~45%) */}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Frequently Asked Questions"
          className="md:col-span-5 flex flex-col gap-3.5"
        >
          {FAQ_ITEMS.map((item, idx) => (
            <FAQQuestionCard
              key={item.id}
              item={item}
              index={idx}
              isActive={activeIndex === idx}
              inView={inView}
              reduceMotion={reduceMotion}
              onSelect={() => setActiveIndex(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              buttonRef={(el) => {
                tabRefs.current[idx] = el;
              }}
            />
          ))}
        </div>

        {/* Right Answer Panel (~55%) */}
        <div className="md:col-span-7">
          <FAQAnswerPanel
            activeItem={activeItem}
            activeIndex={activeIndex}
            inView={inView}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>

      {/* Mobile Single-Column Accordion */}
      <div className="md:hidden">
        <MobileFAQAccordion
          items={FAQ_ITEMS}
          activeIndex={activeIndex}
          reduceMotion={reduceMotion}
          onSelect={setActiveIndex}
        />
      </div>
    </section>
  );
}
